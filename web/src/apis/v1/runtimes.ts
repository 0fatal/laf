// @ts-ignore
/* eslint-disable */
///////////////////////////////////////////////////////////////////////
//                                                                   //
// this file is autogenerated by service-generate                    //
// do not edit this file manually                                    //
//                                                                   //
///////////////////////////////////////////////////////////////////////
/// <reference path = "api-auto.d.ts" />
import request from '@/utils/request';
import useGlobalStore from "@/pages/globalStore";

/**
* Get application runtime list
*/
export async function AppControllerGetRuntimes(
  params: Paths.AppControllerGetRuntimes.BodyParameters,
): Promise<{
    error: string;
    data: Paths.AppControllerGetRuntimes.Responses
}> {
  // /v1/runtimes
  let _params: { [key: string]: any } = {
    appid: useGlobalStore.getState().currentApp?.appid || '',
    ...params,
  };
  return request(`/v1/runtimes`, {
    method: 'GET',
    params : params,
  });
}

