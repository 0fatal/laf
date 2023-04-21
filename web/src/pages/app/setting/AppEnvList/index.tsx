import { useRef } from "react";
import { Button, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";
import dotenv from "dotenv";
import { t } from "i18next";

import ConfirmButton from "@/components/ConfirmButton";
import ENVEditor from "@/components/Editor/ENVEditor";
import { COLOR_MODE } from "@/constants";

import { useEnvironmentQuery, useUpdateEnvironmentMutation } from "./service";

import useGlobalStore from "@/pages/globalStore";

// convert [{name: "SERVER_SECRET", value: "demo"}, {name: "MOCK", value: "YES"}] to string like SERVER_SECRET=demo\nMOCK=YES
const convertToEnv = (tableData: any[]) => {
  if (!tableData) return "";
  return tableData.reduce((acc, { name, value }) => {
    return acc + `${name}="${value}"\n`;
  }, "");
};

const AppEnvList = (props: { onClose?: () => {} }) => {
  const globalStore = useGlobalStore((state) => state);
  const environmentQuery = useEnvironmentQuery();
  const updateEnvironmentMutation = useUpdateEnvironmentMutation();

  const { colorMode } = useColorMode();
  const envValue = useRef(convertToEnv(environmentQuery?.data?.data));
  return (
    <>
      <div className="flex h-full flex-grow flex-col pb-4">
        <div
          className={clsx("relative h-full flex-1 rounded border", {
            "border-frostyNightfall-200": !(colorMode === COLOR_MODE.dark),
          })}
        >
          <ENVEditor
            value={convertToEnv(environmentQuery?.data?.data)}
            height="95%"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
            }}
            colorMode={colorMode}
            onChange={(value) => {
              envValue.current = value;
            }}
          />
        </div>
        <ConfirmButton
          onSuccessAction={async () => {
            const obj = dotenv.parse(envValue.current || "");
            // convert obj to [{ name: '', value: ''}]
            const arr = Object.keys(obj).map((key) => {
              return { name: key, value: obj[key] };
            });
            const res = await updateEnvironmentMutation.mutateAsync(arr);
            if (!res.error) {
              globalStore.updateCurrentApp(globalStore.currentApp!);
              props.onClose && props.onClose();
            }
          }}
          headerText={String(t("Update"))}
          bodyText={String(t("SettingPanel.UpdateConfirm"))}
          confirmButtonText={String(t("Update"))}
        >
          <Button className="mt-4 h-8 w-28 self-end">{t("Update")}</Button>
        </ConfirmButton>
      </div>
    </>
  );
};

export default AppEnvList;
