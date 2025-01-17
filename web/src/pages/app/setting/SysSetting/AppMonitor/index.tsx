import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Center } from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { ErrorIcon } from "@/components/CommonIcon";

import { MonitorDataType } from "../../../mods/StatusBar/MonitorBar";

import AreaCard from "./AreaCard";
import PieCard from "./PieCard";

import { MonitorControllerGetData } from "@/apis/v1/monitor";
import useGlobalStore from "@/pages/globalStore";

export default function AppMonitor() {
  const { t } = useTranslation();
  const { currentApp } = useGlobalStore();
  const { limitCPU, limitMemory, databaseCapacity, storageCapacity } = currentApp.bundle.resource;

  const [dataNumber, setDataNumber] = useState(0);
  const queryClient = useQueryClient();

  const { data: monitorData } = useQuery(
    ["useGetMonitorDataQuery"],
    () => {
      return MonitorControllerGetData({
        q: MonitorDataType,
        step: 60,
        type: "range",
      });
    },
    {
      refetchInterval: 60000,
    },
  );

  const podsArray = useMemo(() => {
    return monitorData?.data?.cpuUsage?.map((item: any) => item.metric.pod).length >
      monitorData?.data?.memoryUsage?.map((item: any) => item.metric.pod).length
      ? monitorData?.data?.cpuUsage?.map((item: any) => item.metric.pod)
      : monitorData?.data?.memoryUsage?.map((item: any) => item.metric.pod);
  }, [monitorData?.data?.cpuUsage, monitorData?.data?.memoryUsage]);

  return (
    <div className="flex w-full">
      {monitorData?.data && Object.keys(monitorData?.data).length !== 0 ? (
        <>
          <div className="mr-4 mt-10 h-[413px] w-full rounded-xl border bg-[#F8FAFB] pb-4">
            <AreaCard
              data={monitorData?.data?.cpuUsage}
              strokeColor="#47C8BF"
              fillColor="#E6F6F6"
              setDataNumber={setDataNumber}
              dataNumber={dataNumber}
              podsArray={podsArray}
              title="CPU"
              unit="Core"
              maxValue={limitCPU / 1000}
              className="h-1/2 p-4"
            />
            <AreaCard
              data={monitorData?.data?.memoryUsage}
              strokeColor="#9A8EE0"
              fillColor="#F2F1FB"
              title={t("Spec.RAM")}
              unit="MB"
              maxValue={limitMemory}
              dataNumber={dataNumber}
              className="h-1/2 p-4"
            />
          </div>
          <div className="mr-2 mt-10 h-[396px] w-full space-y-4">
            <PieCard
              data={monitorData?.data?.databaseUsage}
              maxValue={databaseCapacity}
              title={t("Spec.Database")}
              colors={["#47C8BF", "#D5D6E1"]}
            />
            <PieCard
              data={monitorData?.data?.storageUsage}
              maxValue={storageCapacity}
              title={t("Spec.Storage")}
              colors={["#9A8EE0", "#D5D6E1"]}
            />
          </div>
        </>
      ) : (
        <Center className="h-[400px] w-full">
          <span className="flex flex-col items-center">
            <ErrorIcon boxSize={16} />
            <span className="flex pt-2 text-xl">
              <p className="">{t("Error")}</p>
              <u
                className="cursor-pointer text-primary-600"
                onClick={async () => {
                  await queryClient.invalidateQueries({
                    queryKey: ["useGetMonitorDataQuery"],
                    refetchType: "all",
                  });
                }}
              >
                {t("Retry")}
              </u>
            </span>
          </span>
        </Center>
      )}
    </div>
  );
}
