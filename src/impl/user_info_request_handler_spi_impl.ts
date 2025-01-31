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


import { UserInfoRequestHandlerSpiAdapter } from 'https://deno.land/x/authlete_deno@v1.2.0/mod.ts';
import { UserDao } from '../db/user_dao.ts';


/**
 * Implementation of `UserInfoRequestHandlerSpi` interface.
 *
 * This is supposed to be given to the constructor of `UserInfoRequestHandler`.
 */
export class UserInfoRequestHandlerSpiImpl extends UserInfoRequestHandlerSpiAdapter
{
    public getUserClaimValue(subject: string, claimName: string, languageTag?: string): any
    {
        // Get an user entity by the subject.
        const ue = UserDao.getBySubject(subject);

        // Get a value of the claim if the user entity is available.
        return ue === null ? null : ue.getClaim(claimName);
    }
}