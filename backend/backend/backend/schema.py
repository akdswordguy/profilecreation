# backend/schema.py
from users.schema import Query, Mutation
import strawberry

schema = strawberry.Schema(query=Query, mutation=Mutation)
