"use client"

import { Combobox, TextInput, useCombobox, Image, Group } from "@mantine/core";
import { useState } from "react";

type DashboardSearchbarProps = {
    items: {id: string, shortName: string, fullName: string, tendency: number}[],
    onUpdateItems: (searchPrefix: string) => void
    onSelectedItem: (marketId: string) => void
}

export const DashboardSearchbar: React.FC<DashboardSearchbarProps> = ({ items, onUpdateItems, onSelectedItem }) => {
    const [search, setSearch] = useState("");

    const combobox = useCombobox({
        onDropdownClose: () => {
            combobox.resetSelectedOption();
            combobox.focusTarget();
        },
    });

    const options = items.length > 0 ? items.map(item => (
        <Combobox.Option value={item.id} key={item.id}>
            <Group>
                {
                    item.tendency >= 0
                    ? (<Image src="/arrow_green.svg" alt="arrow_green" />)
                    : (<Image src="/arrow_red.svg" alt="arrow_red" />)
                }
                <p className={"font-bold text-transparent bg-clip-text bg-linear-to-b " +
                    (item.tendency < 0 ? "from-[#EA161A] to-[#7F1214]" : "from-[#1AD635] to-[#084811]")}>{item.tendency}</p>
                <p className="font-bold">{item.shortName}</p>
                <p>{item.fullName}</p>
            </Group>
        </Combobox.Option>
    )) : (
        <p className="text-[#808080] p-[5px]">No markets found...</p>
    );
    const searchIcon = <Image src="/search.svg" alt="search_icon" />;

    return (
        <Combobox
            store={combobox}
            classNames={{
                dropdown: "bg-[#F1F6F9]! p-0! text-main! ",
                option: "hover:bg-[#F1F6F980]!"
            }}
            onOptionSubmit={ val => {
                onSelectedItem(val);
                setSearch("");
                onUpdateItems("");
                combobox.closeDropdown();
            } }
        >
            <Combobox.Target>
                <TextInput
                    classNames={{
                        input: "bg-[#39486726]! border-transparent! rounded-[28px]! placeholder-[#39486780]! text-main!"
                    }}
                    placeholder="Pick a value or type anything"
                    value={search}
                    rightSection={searchIcon}
                    onChange={ event => {
                        const oldSearch = search;
                        setSearch(event.currentTarget.value);
                        onUpdateItems(event.currentTarget.value);
                        if (event.currentTarget.value === "") {
                            combobox.closeDropdown();
                        } else {
                            if (oldSearch === "") {
                                combobox.openDropdown();
                            }
                        }
                    } }
                />
            </Combobox.Target>
            <Combobox.Dropdown>
                <div className="p-(--combobox-padding) bg-[#39486726]">
                    <Combobox.Options>{options}</Combobox.Options>
                </div>
            </Combobox.Dropdown>
        </Combobox>
    );
};