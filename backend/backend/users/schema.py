import strawberry
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
import typing
from strawberry.types import Info
from django.http import HttpRequest
from django.contrib.auth import login as auth_login
from .models import UserProfile


@strawberry.type
class UserType:
    id: int
    username: str
    email: str


@strawberry.type
class AuthPayload:
    user: typing.Optional[UserType]
    token: typing.Optional[str]
    error: typing.Optional[str]


@strawberry.input
class UpdateProfileInput:
    first_name: str
    last_name: str
    phone: str
    street: str
    city: str
    landmark: str
    state: str
    country: str
    postal_code: str


@strawberry.type
class UpdateProfilePayload:
    success: bool
    message: str


@strawberry.type
class UserProfileType:
    first_name: str
    last_name: str
    email: str
    phone: str
    street: str
    city: str
    landmark: str
    state: str
    country: str
    postal_code: str

@strawberry.type
class Query:
    @strawberry.field
    def myProfile(self, info: Info) -> typing.Optional[UserProfileType]:
        user = info.context.request.user
        if not user.is_authenticated:
            return None

        profile, _ = UserProfile.objects.get_or_create(user=user)
        return UserProfileType(
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            phone=profile.phone or "",
            street=profile.street or "",
            city=profile.city or "",
            landmark=profile.landmark or "",
            state=profile.state or "",
            country=profile.country or "",
            postal_code=profile.postal_code or "",
        )


@strawberry.type
class Mutation:
    @strawberry.mutation
    def signup(self, username: str, password: str, email: str) -> AuthPayload:
        if User.objects.filter(username=username).exists():
            return AuthPayload(user=None, token=None, error="Username already exists")
        user = User.objects.create_user(username=username, password=password, email=email)
        return AuthPayload(user=user, token="dummy_token", error=None)

    @strawberry.mutation
    def login(self, info: Info, username: str, password: str) -> AuthPayload:
        user = authenticate(username=username, password=password)
        if user is None:
            return AuthPayload(user=None, token=None, error="Invalid credentials")

        auth_login(info.context.request, user)
        return AuthPayload(user=user, token="dummy_token", error=None)


    @strawberry.mutation
    def update_profile(self, info: Info, input: UpdateProfileInput) -> UpdateProfilePayload:
        user = info.context.request.user
        if not user.is_authenticated:
            return UpdateProfilePayload(success=False, message="Authentication required")

        user.first_name = input.first_name
        user.last_name = input.last_name
        user.save()
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.phone = input.phone
        profile.street = input.street
        profile.city = input.city
        profile.landmark = input.landmark
        profile.state = input.state
        profile.country = input.country
        profile.postal_code = input.postal_code
        profile.save()

        return UpdateProfilePayload(success=True, message="Profile updated successfully")
