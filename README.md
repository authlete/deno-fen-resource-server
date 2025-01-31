Resource Server Implementation in Deno
=============================================

Overview
--------

This is a resource server implementation in Deno. It supports a
[userinfo endpoint][UserInfoEndpoint] defined in [OpenID Connect Core 1.0][OIDCCore]
and includes an example of a protected resource endpoint that accepts
an access token in the ways defined in [RFC 6750][RFC6750] (The OAuth
2.0 Authorization Framework: Bearer Token Usage).

This implementation is written using [Fen][Fen] framework and
[authlete-deno][AuthleteDeno] library.

To validate an access token presented by a client application, this
resource server makes an inquiry to the [Authlete][Authlete] server.
This means that this resource server expects that the authorization
server which has issued the access token uses Authlete as a backend
service. [deno-fen-oauth-server][DenoFenOAuthServer] is such an authorization
server implementation and it supports [OAuth 2.0][RFC6749] and
[OpenID Connect][OIDC].

License
-------

  Apache License, Version 2.0

Source Code
-----------

  <code>https://github.com/authlete/deno-fen-oauth-server</code>

About Authlete
--------------

[Authlete][Authlete] is a cloud service that provides an implementation of
OAuth 2.0 & OpenID Connect ([overview][AuthleteOverview]). You can easily get
the functionalities of OAuth 2.0 and OpenID Connect either by using the default
implementation provided by Authlete or by implementing your own authorization
server using [Authlete Web APIs][AuthleteAPI].

To use this resource server implementation, you need to get API credentials
from Authlete and set them in `authlete.json`. The steps to get API credentials
are very easy. All you have to do is just to register your account
([sign up][AuthleteSignUp]). See [Getting Started][AuthleteGettingStarted]
for details.

How To Run
----------

1. Download the code.

        $ git clone https://github.com/authlete/deno-fen-resource-server.git
        $ cd deno-fen-resource-server

2. Edit the configuration file to set the API credentials of yours.

        $ vi authlete.json

3. Start the resource server on `http://localhost:1903`.

        $ deno run --allow-net --allow-read --config tsconfig.json src/server.ts

Endpoints
---------

This implementation exposes endpoints as listed in the table below.

| Endpoint          | Path            |
|:------------------|:----------------|
| UserInfo Endpoint | `/api/userinfo` |
| Time Endpoint     | `/api/time`     |

#### UserInfo Endpoint

The userinfo endpoint is an implementation of the requirements
described in [5.3. UserInfo Endpoint][UserInfoEndpoint] of [OpenID Connect
Core 1.0][OIDCCore].

The endpoint accepts an access token as a Bearer Token. That is,
it accepts an access token via `Authorization: Bearer {access-token}`
or by a request parameter `access_token={access-token}`. See
[RFC 6750][RFC6750] for details.

The endpoint returns user information in JSON or [JWT][RFC7519] format,
depending on the configuration of the client application. If both
`userinfo_signed_response_alg` and `userinfo_encrypted_response_alg`
of the metadata of the client application are not specified, user
information is returned as a plain JSON. Otherwise, it is returned
as a serialized JWT. Authlete provides you with a Web console
([Developer Console][DeveloperConsole]) to manage metadata of client
applications. As for metadata of client applications, see [2. Client Metadata][ClientMetadata]
in [OpenID Connect Dynamic Client Registration 1.0][DCR].

User information returned from the endpoint contains [claims][Claims]
of the user. In short, _claims_ are pieces of information about
the user such as a given name and an email address. Because Authlete
does not manage user data (although it supports OpenID Connect),
you have to provide claim values. It is achieved by implementing
`UserInfoRequestHandlerSpi` interface.

In this resource server implementation, `UserInfoRequestHandlerSpiImpl`
is an example implementation of `UserInfoRequestHandlerSpi` interface
and it retrieves claim values from a dummy database. You need to modify
the implementation to make it refer to your actual user database.

#### Time Endpoint

The time endpoint implemented in this resource server is just an
example of a protected resource endpoint. Its main purpose is to
show how to validate an access token at a protected resource
endpoint.

The path of the time endpoint is `/api/time`. Because the endpoint
supports all the three ways defined in [RFC 6750][RFC6750], you can pass
an access token to the endpoint by any means of the following.

```
# RFC 6750, 2.1. Authorization Request Header Field
$ curl -v http://localhost:1903/api/time \
       -H 'Authorization: Bearer {access_token}'
```

```
# RFC 6750, 2.2. Form-Encoded Body Parameter
$ curl -v http://localhost:1903/api/time \
       -d access_token={access_token}
```

```
# RFC 6750, 2.3. URI Query Parameter
$ curl -v http://localhost:1903/api/time\?access_token={access_token}
```

The time endpoint returns information about the current time (UTC)
in JSON format. The following is an example response.

```json
{
  "year":        2020,
  "month":       8,
  "day":         12,
  "hour":        15,
  "minute":      9,
  "second":      10,
  "millisecond": 15
}
```

As for generic and Authlete-specific information regarding how to
protect Web APIs by OAuth 2.0 access tokens, see [Protected Resource][ProtectedResource]
in [Authlete Definitive Guide][AuthleteDefinitiveGuide].

See Also
--------

- [Authlete][Authlete] - Authlete Home Page
- [authlete-deno][AuthleteDeno] - Authlete Library for Deno
- [deno-fen-oauth-server][DenoFenOAuthServer] - Authorization Server Implementation

Contact
-------

Contact Form : https://www.authlete.com/contact/

| Purpose   | Email Address        |
|:----------|:---------------------|
| General   | info@authlete.com    |
| Sales     | sales@authlete.com   |
| PR        | pr@authlete.com      |
| Technical | support@authlete.com |

[Authlete]:                https://www.authlete.com/
[AuthleteAPI]:             https://docs.authlete.com/
[AuthleteGettingStarted]:  https://www.authlete.com/developers/getting_started/
[AuthleteOverview]:        https://www.authlete.com/developers/overview/
[AuthleteDefinitiveGuide]: https://www.authlete.com/documents/definitive_guide
[AuthleteDeno]:            https://github.com/authlete/authlete-deno
[AuthleteSignUp]:          https://so.authlete.com/accounts/signup
[Claims]:                  https://openid.net/specs/openid-connect-core-1_0.html#Claims
[ClientMetadata]:          https://openid.net/specs/openid-connect-registration-1_0.html#ClientMetadata
[DCR]:                     https://openid.net/specs/openid-connect-registration-1_0.html
[DenoFenOAuthServer]:      https://github.com/authlete/deno-fen-oauth-server/
[DeveloperConsole]:        https://www.authlete.com/developers/cd_console/
[Fen]:                     https://github.com/fen-land/deno-fen
[OIDC]:                    https://openid.net/connect/
[OIDCCore]:                https://openid.net/specs/openid-connect-core-1_0.html
[ProtectedResource]:       https://www.authlete.com/documents/definitive_guide/protected_resource
[RFC6749]:                 https://tools.ietf.org/html/rfc6749
[RFC6750]:                 https://tools.ietf.org/html/rfc6750
[RFC7519]:                 https://tools.ietf.org/html/rfc7519
[UserInfoEndpoint]:        https://openid.net/specs/openid-connect-core-1_0.html#UserInfo