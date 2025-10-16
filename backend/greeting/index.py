import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для получения и обновления настроек приветствия (текст и изображение)
    Args: event - dict с httpMethod, body, headers
          context - объект с request_id, function_name
    Returns: HTTP response dict с настройками или статусом обновления
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    if method == 'GET':
        cur.execute("SELECT message, image_url FROM greeting_settings ORDER BY id DESC LIMIT 1")
        row = cur.fetchone()
        
        if row:
            result = {
                'message': row[0],
                'imageUrl': row[1]
            }
        else:
            result = {
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
    
    if method == 'POST':
        auth_token = event.get('headers', {}).get('X-Auth-Token', '')
        
        if auth_token != '210212':
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
        message = body_data.get('message', '')
        image_url = body_data.get('imageUrl', '')
        
        cur.execute(
            "UPDATE greeting_settings SET message = %s, image_url = %s, updated_at = CURRENT_TIMESTAMP WHERE id = 1",
            (message, image_url)
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
