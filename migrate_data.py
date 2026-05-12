import os
import sys
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
from sqlalchemy import create_engine, text

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(BASE_DIR, '.env'))

cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET')
)

sqlite_uri = 'sqlite:///' + os.path.join(BASE_DIR, 'zarni.db')
pg_uri = os.environ.get('DATABASE_URL')

def upload_to_cloudinary(filepath, resource_type='auto'):
    if not filepath or not os.path.exists(filepath):
        return None
    print(f"Uploading {filepath} to Cloudinary...")
    try:
        response = cloudinary.uploader.upload(filepath, resource_type=resource_type)
        return response.get('secure_url')
    except Exception as e:
        print(f"Error uploading {filepath}: {e}")
        return None

def migrate():
    from app import create_app, db
    app = create_app()
    
    # 1. Create tables in Postgres
    app.config['SQLALCHEMY_DATABASE_URI'] = pg_uri
    with app.app_context():
        print("Creating tables in Postgres...")
        db.create_all()
        # Ensure we have a clean slate or handle conflicts
        
    # 2. Extract from SQLite using a separate engine to avoid messing with Flask's db context
    engine_sqlite = create_engine(sqlite_uri)
    engine_pg = create_engine(pg_uri)
    
    tables = [
        'users', 'courses', 'packages', 'package_courses', 'chapters',
        'orders', 'commissions', 'wallet_transactions', 'withdrawals'
    ]
    
    with engine_sqlite.connect() as conn_sl:
        with engine_pg.connect() as conn_pg:
            for table in tables:
                print(f"Migrating table {table}...")
                rows = conn_sl.execute(text(f"SELECT * FROM {table}")).fetchall()
                if not rows:
                    continue
                
                # Get column names
                keys = rows[0]._mapping.keys()
                cols = ', '.join(keys)
                params = ', '.join([':' + k for k in keys])
                
                insert_sql = text(f"INSERT INTO {table} ({cols}) VALUES ({params}) ON CONFLICT DO NOTHING")
                
                for row in rows:
                    data = dict(row._mapping)
                    
                    # Upload and replace local paths for specific columns
                    if table == 'users' and data.get('profile_image'):
                        if not data['profile_image'].startswith('http'):
                            path = os.path.join(BASE_DIR, 'static', 'img', 'uploads', data['profile_image'])
                            url = upload_to_cloudinary(path, 'image')
                            if url: data['profile_image'] = url
                            
                    elif table == 'packages' and data.get('thumbnail_filename'):
                        if not data['thumbnail_filename'].startswith('http'):
                            path = os.path.join(BASE_DIR, 'static', 'img', 'uploads', data['thumbnail_filename'])
                            url = upload_to_cloudinary(path, 'image')
                            if url: data['thumbnail_filename'] = url
                            
                    elif table == 'courses' and data.get('thumbnail_filename'):
                        if not data['thumbnail_filename'].startswith('http'):
                            path = os.path.join(BASE_DIR, 'static', 'img', 'uploads', data['thumbnail_filename'])
                            url = upload_to_cloudinary(path, 'image')
                            if url: data['thumbnail_filename'] = url
                            
                    elif table == 'chapters' and data.get('video_filename'):
                        if not data['video_filename'].startswith('http'):
                            path = os.path.join(BASE_DIR, 'video_uploads', data['video_filename'])
                            url = upload_to_cloudinary(path, 'video')
                            if url: data['video_filename'] = url

                    # Fix booleans for postgres
                    for k, v in data.items():
                        if isinstance(v, int) and (k.startswith('is_') or k == 'certificate'):
                            data[k] = bool(v)
                            
                    try:
                        conn_pg.execute(insert_sql, data)
                    except Exception as e:
                        print(f"Error inserting row in {table}: {e}")
                        
            conn_pg.commit()
    print("Migration completed.")

if __name__ == '__main__':
    migrate()
