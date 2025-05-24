"use client"

import { Combobox, TextInput, useCombobox, Image } from "@mantine/core";
import { useState } from "react";

type Props = { items: {value: string, key: string, component: JSX.Element}[] }

export const DashboardSearchbar: React.FC<Props> = ({ items }) => {
    const [search, setSearch] = useState('');
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    const combobox = useCombobox({
        onDropdownClose: () => {
            combobox.resetSelectedOption();
            combobox.focusTarget();
        },
    });

    const options = items.map(item => (
        <Combobox.Option value={item.value} key={item.key}>
            {item.component}
        </Combobox.Option>
    ));
    const searchIcon = <Image src="/search.svg" alt="search_icon" />;

    return (
            <Combobox
                store={combobox}
                classNames={{
                    dropdown: "bg-[#F1F6F9]! p-0! text-main! ",
                    option: "hover:bg-[#F1F6F980]!"
                }}
                onOptionSubmit={ val => {
                        setSelectedItem(val);
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
                            setSearch(event.currentTarget.value);
                            combobox.openDropdown();
                        } }
                        onClick={() => combobox.openDropdown()}
                        onBlur={() => combobox.closeDropdown()}
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