// Copyright (C) 2020 Authlete, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


import { UserInfoRequestHandler } from 'https://deno.land/x/authlete_deno@v1.2.0/mod.ts';
import { UserInfoRequestHandlerSpiImpl } from '../impl/user_info_request_handler_spi_impl.ts';
import { BaseResourceEndpoint } from './base_resource_endpoint.ts';


/**
 * An implementation of userinfo endpoint. See [5.3. UserInfo Endpoint
 * ](http://openid.net/specs/openid-connect-core-1_0.html#UserInfo) of
 * [OpenID Connect Core 1.0](http://openid.net/specs/openid-connect-core-1_0.html).
 */
export class UserInfoEndpoint extends BaseResourceEndpoint
{
    /**
     * UserInfo endpoint for GET method.
     */
    public async get()
    {
        await this.process(async () => {
            return await this.handle();
        });
    }


    /**
     * UserInfo endpoint for POST method.
     */
    public async post()
    {
        await this.processForApplicationFormUrlEncoded(async () => {
            return await this.handle();
        });
    }


    private async handle()
    {
        // Extract an access token from the userinfo request.
        const accessToken = this.extractAccessToken();

        // Handle the request.
        return await new UserInfoRequestHandler(
            this.api, new UserInfoRequestHandlerSpiImpl()
        ).handle({ accessToken: accessToken });
    }
}