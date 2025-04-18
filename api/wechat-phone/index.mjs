import axios from 'axios';
import crypto from 'crypto';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const dynamo = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
  try {
    const method = event.requestContext.http.method;
    if (method === 'GET') {
        let action = event.queryStringParameters.action;
        if (action === 'get_products') {
            return getProducts();
        } else if (action === 'get_orders') {
            let userId = event.queryStringParameters.user_id;
            let role = event.queryStringParameters.role;
            if (role === 'admin') {
                let date = event.queryStringParameters.date;
                return getAdminOrders(userId, date);
            } else {
                return getOrders(userId);
            }
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({error: 'Action not supported'})
            };
        }
    } else {
        const body = JSON.parse(event.body);
        if (typeof body === 'string') {
            body = JSON.parse(body);
        }

        if (body.action === 'verify') {
            return await verifyUser(body);
        } else if (body.action === 'update_user') {
            return await updateUser(body);
        } else if (body.action === 'create_order') {
            return await createOrder(body);
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({error: 'Action not supported'})
            };
        }
    }
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error', details: err.message })
    };
  }
};

const getAdminOrders = async (userId, date) => {
    const userParams = {
        TableName: 'wechat_users',
        Key: {
          openid: userId
        }
      };
    const user = await dynamo.get(userParams).promise();
    if (user.role !== 'admin') {
        return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Permission denied'})
        }
    }
    let queryDate = date ?? new Date().toISOString().substring(0, 10);
    const orderParams = {
        TableName: 'order',
        IndexName: 'create-time-index',
        KeyConditionExpression: 'create_date = :date',
        ExpressionAttributeValues: {
            ':date': queryDate
        },
        ScanIndexForward: false
    };
    const orders = await dynamo.query(orderParams).promise();
    return {
        statusCode: 200,
        body: JSON.stringify(orders.map(({ id, created_at, items, status, total_price, invoice, user_address, user_name, user_phone }) => ({ id, created_at: new Date(created_at).toISOString().replace('T', ' ').substring(0, 19), items, status, total_price, invoice, user_address, user_name, user_phone })))
    }
}

const getOrders = async (userId) => {
    if (!userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Bad request'})
        };
    }
    const params = {
        TableName: 'order',
        IndexName: 'user-index',
        KeyConditionExpression: 'user_id = :uid',
        ExpressionAttributeValues: {
            ':uid': userId
        },
        ScanIndexForward: false
    };

    const orders = await dynamo.query(params).promise();
    return {
        statusCode: 200,
        body: JSON.stringify(orders.Items.map(({ id, created_at, items, status, total_price, invoice }) => ({ id, created_at: new Date(created_at).toISOString().replace('T', ' ').substring(0, 19), items, status, total_price, invoice })))
    };
}


const createOrder = async (body) => {
    const { address, name, openid, phone, items } = body;
    if (!address || !name || !openid || !phone) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Bad request'})
        };
    }
    if (!Array.isArray(items) || items.length === 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'products must be a non-empty array' })
        };
    }

    const keys = items.map(({ id })  => ({ id }));
    const params = {
        RequestItems: {
            'products': {
                Keys: keys
            }
        }
    };

    const data = await dynamo.batchGet(params).promise();
    const fetchedItems = data.Responses['products'];
    const validItems = Object.fromEntries(fetchedItems.filter(item => item.deleted === false).map(item => [item.id, item]));
    const missingItems = items.filter(item => item.quantity == 0 || !validItems.hasOwnProperty(item.id))
    if (missingItems.length > 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Some products not found or deleted', missingItems })
        };
    }

    const updateParams = {
      TableName: 'sequence',
      Key: { type: 'order' },
      UpdateExpression: 'SET #count = if_not_exists(#count, :start) + :inc',
      ExpressionAttributeNames: {
        '#count': 'count'
      },
      ExpressionAttributeValues: {
        ':inc': 1,
        ':start': 0
      },
      ReturnValues: 'UPDATED_NEW'
    };
    const updateResult = await dynamo.update(updateParams).promise();
    const invoice = `INV${String(updateResult.Attributes.count).padStart(5, '0')}`;

    const id = uuidv4();
    const now = new Date();
    const date = now.toISOString().substring(0, 10);
    const orderItems = items.map(({ id, quantity }) => {
        let { sn, name, price } = validItems[id];
        return { id, sn, name, price, quantity }
    })
    const total = orderItems.reduce((sum, item) => {
        return sum + item.price * item.quantity;
    }, 0);
    await dynamo.put({
        TableName: 'order',
        Item: {
            id,
            user_id: decodeURIComponent(openid),
            user_name: decodeURIComponent(name),
            user_phone: decodeURIComponent(phone),
            user_address: decodeURIComponent(address),
            created_at: now.getTime(),
            create_date: date,
            items: orderItems,
            total_price: total,
            invoice: invoice,
            status: 'PENDING'
        }
    }).promise();
    return {
        statusCode: 201,
        body: JSON.stringify({ id: id, invoice: invoice, price: total})
    };
}

const getProducts = async (body) => {
    const products = await dynamo.scan({
        TableName: 'products',
        FilterExpression: 'deleted = :false',
        ExpressionAttributeValues: {
          ':false': false
        }
      }).promise();
    return {
        statusCode: 200,
        body: JSON.stringify(products.Items.map(({ id, sn, name, description, price, url }) => ({ id, sn, name, description, price, url })))
    };
}

const updateUser = async (body) => {
    const { openid, phone, name } = body;
    if (!openid || !phone || !name) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Bad request'})
        };
    }
    const now = new Date().toISOString();
    await dynamo.update({
      TableName: 'wechat_users',
      Key: {
        openid: openid,
        phone: phone
      },
      UpdateExpression: 'SET #name = :name, #updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#updatedAt': 'updated_at'
      },
      ExpressionAttributeValues: {
        ':name': name,
        ':updatedAt': now
      },
      ReturnValues: 'ALL_NEW'
    }).promise();
    return {
        statusCode: 200,
        body: JSON.stringify({ msg: 'Name updated' })
    };
}

const verifyUser = async (body) => {
    const { code, encryptedData, iv } = body;
    if (!code || !encryptedData || !iv) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Bad request'})
        };
    }

    const appid = process.env.WECHAT_APPID;
    const secret = process.env.WECHAT_SECRET;

    // 1. Exchange code for session_key
    const sessionRes = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid,
        secret,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const { session_key, openid } = sessionRes.data;

    if (!session_key || !openid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Failed to get session_key and openid' })
      };
    }

    // 2. Decrypt phone number
    const decipher = crypto.createDecipheriv(
      'aes-128-cbc',
      Buffer.from(session_key, 'base64'),
      Buffer.from(iv, 'base64')
    );
    decipher.setAutoPadding(true);

    let decoded = decipher.update(Buffer.from(encryptedData, 'base64'), 'binary', 'utf8');
    decoded += decipher.final('utf8');
    const phoneData = JSON.parse(decoded);
    const phone = phoneData.phoneNumber;

    // 3. Save to DynamoDB
    const existing = await dynamo.get({
        TableName: 'wechat_users',
        Key: { openid: openid,
            phone: phone }
    }).promise();
    if (!existing.Item) {
        const now = new Date().toISOString();
        await dynamo.put({
        TableName: 'wechat_users',
        Item: {
            openid,
            phone,
            role: 'user',
            created_at: now,
            updated_at: now
        }
        }).promise();
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ phone: phone,  openid: openid })
    };
}
