import json
import os
import psycopg2
from typing import Dict, Any

ADMIN_PASSWORD = "210212251277"

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для работы с несколькими версиями приветствий по уникальному ID
    Args: event - dict с httpMethod, body, headers, queryStringParameters
          context - объект с request_id, function_name
    Returns: HTTP response dict с настройками, списком версий или статусом обновления
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    schema = 't_p33753390_simple_site_white_pu'
    
    if method == 'GET':
        query_params = event.get('queryStringParameters') or {}
        greeting_id = query_params.get('id', 'default')
        action = query_params.get('action', 'get')
        
        if action == 'list':
            cur.execute(f"SELECT id, message, image_url FROM {schema}.greeting_settings ORDER BY created_at DESC LIMIT 100")
            rows = cur.fetchall()
            
            result = {
                'versions': [{'id': row[0], 'message': row[1], 'imageUrl': row[2]} for row in rows]
            }
        else:
            cur.execute(f"SELECT message, image_url FROM {schema}.greeting_settings WHERE id = %s", (greeting_id,))
            row = cur.fetchone()
            
            if row:
                result = {
                    'id': greeting_id,
                    'message': row[0],
                    'imageUrl': row[1]
                }
            else:
                result = {
                    'id': greeting_id,
                    'message': 'Добро пожаловать!',
                    'imageUrl': 'https://cdn.poehali.dev/projects/5575572e-9552-4ad2-b010-e12c5cc8067f/files/75543a6c-c893-4198-a0ba-6b48e331eb86.jpg'
                }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
    
    if method == 'POST' or method == 'PUT':
        headers = {k.lower(): v for k, v in event.get('headers', {}).items()}
        auth_token = headers.get('x-auth-token', '')
        
        if auth_token != ADMIN_PASSWORD:
            cur.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Unauthorized'}),
                'isBase64Encoded': False
            }
        
        body_data = json.loads(event.get('body', '{}'))
        greeting_id = body_data.get('id', 'default')
        message = body_data.get('message', '')
        image_url = body_data.get('imageUrl', '')
        
        cur.execute(
            f"INSERT INTO {schema}.greeting_settings (id, message, image_url, updated_at) VALUES (%s, %s, %s, CURRENT_TIMESTAMP) ON CONFLICT (id) DO UPDATE SET message = %s, image_url = %s, updated_at = CURRENT_TIMESTAMP",
            (greeting_id, message, image_url, message, image_url)
        )
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': True, 'id': greeting_id}),
            'isBase64Encoded': False
        }
    
    if method == 'DELETE':
        headers = {k.lower(): v for k, v in event.get('headers', {}).items()}
        auth_token = headers.get('x-auth-token', '')
        
        if auth_token != ADMIN_PASSWORD:
            cur.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Unauthorized'}),
                'isBase64Encoded': False
            }
        
        body_data = json.loads(event.get('body', '{}'))
        greeting_id = body_data.get('id', '')
        
        if greeting_id == 'default':
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Cannot delete default greeting'}),
                'isBase64Encoded': False
            }
        
        cur.execute("DELETE FROM greeting_settings WHERE id = %s", (greeting_id,))
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': True}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }