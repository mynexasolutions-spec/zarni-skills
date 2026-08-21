"""add public_code to packages

Revision ID: 8decd4964342
Revises: ac03dd825ade
Create Date: 2026-08-21 16:28:45.859775

"""
from alembic import op
import sqlalchemy as sa
import secrets
import string


# revision identifiers, used by Alembic.
revision = '8decd4964342'
down_revision = 'ac03dd825ade'
branch_labels = None
depends_on = None


def _gen_code():
    chars = string.ascii_lowercase + string.digits
    return ''.join(secrets.choice(chars) for _ in range(10))


def upgrade():
    with op.batch_alter_table('packages', schema=None) as batch_op:
        batch_op.add_column(sa.Column('public_code', sa.String(length=16), nullable=True))

    # Backfill existing rows with a random code before the column becomes unique.
    conn = op.get_bind()
    package_ids = [row[0] for row in conn.execute(sa.text('SELECT id FROM packages')).fetchall()]
    seen = set()
    for pkg_id in package_ids:
        code = _gen_code()
        while code in seen:
            code = _gen_code()
        seen.add(code)
        conn.execute(sa.text('UPDATE packages SET public_code = :code WHERE id = :id'), {'code': code, 'id': pkg_id})

    with op.batch_alter_table('packages', schema=None) as batch_op:
        batch_op.create_unique_constraint('uq_packages_public_code', ['public_code'])


def downgrade():
    with op.batch_alter_table('packages', schema=None) as batch_op:
        batch_op.drop_constraint('uq_packages_public_code', type_='unique')
        batch_op.drop_column('public_code')
