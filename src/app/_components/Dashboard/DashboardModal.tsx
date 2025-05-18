import { Group, Modal, Stack, Image, Button } from "@mantine/core";
import { DashboardChart } from "./DashboardChart";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { api } from "~/trpc/react";

type DashboardModalProps = {
    market: { id: string, shortName: string, fullName: string, tendency: number, marketData: { date: Date, value: number }[] } | null,
    inDashboard: boolean,
    onClose: () => void
}

export const DashboardModal: React.FC<DashboardModalProps> = ({ market, inDashboard, onClose }) => {
    const utils = api.useUtils();
    const addMarket = api.market.addMarketToDashboard.useMutation({
        onSuccess: () => {
            utils.market.getDashboard.invalidate();
        }
    });
    const removeMarket = api.market.removeMarketFromDashboard.useMutation({
        onSuccess: () => {
            utils.market.getDashboard.invalidate();
        }
    });

    return <Modal
        opened={market !== null}
        onClose={onClose}
        withCloseButton={false}
        centered={true}
        transitionProps={{transition: undefined}}
        classNames={{
            content: "bg-[#9BA4B5]!",
            body: "bg-[#F1F6F980] text-main p-[30px]!"
        }}
        size="auto"
    >
        {
            market !== null ?
            <Group
                align="start"
            >
                <Stack
                    className="p-[20px]"
                    align="center"
                >
                    <Group>
                        <Group
                            className={ "p-[10px] rounded-[8px] text-3xl border-2! border-[#212A3E] text-white bg-linear-to-b " + (
                                market.tendency < 0 ?
                                "from-[#EA161A] to-[#7F1214]" :
                                "from-[#1AD635] to-[#084811]"
                            )}
                        >
                            <Image
                                src={market.tendency < 0 ? "/arrow_down.svg" : "/arrow_up.svg"}
                                alt="tendency"
                            />
                            <p>{market.tendency}</p>
                        </Group>
                        <p className="text-4xl">{market.shortName}</p>
                    </Group>
                    <p className="text-2xl">{market.fullName}</p>
                    <Button
                        leftSection={inDashboard ? <IconTrash size={18}/> : <IconPlus size={18} />}
                        radius="xl"
                        onClick={() => {
                            if (inDashboard) {
                                removeMarket.mutate({ marketId: market.id });
                            } else {
                                addMarket.mutate({ marketId: market.id });
                            }
                        }}
                    >
                        { inDashboard ? <p>Remove from dashboard</p> : <p>Add to the dashboard</p> }
                    </Button>
                </Stack>
                <DashboardChart
                    zoomable={true}
                    isPositive={market.tendency >= 0}
                    width={500}
                    height={350}
                    data={market.marketData}
                />
            </Group> :
            null
        }
    </Modal>
}