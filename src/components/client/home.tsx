"use client"
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

type InputData = { label: string, value: string, type: "input" }
type SelectData = { label: string, value: string, type: "select", options: string[] }

type Data = {
    [key: string]: InputData | SelectData
}

const monthList = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro"
];

function isSelect(data: Data[string]): data is SelectData {
    return (data as SelectData).type == "select" && (data as SelectData).options != undefined;
}

const numberOfCaregivers = [...Array(6)].map((_, index) => String(index + 1))
const isWeekday = (date: Date) => date.getDay() % 6 !== 0;
const isWeekend = (date: Date) => date.getDay() % 6 === 0;

function getDayOfWeekName(date: Date): string {
    const daysOfWeek = ['dom', '2ª', '3ª', '4ª', '5ª', '6ª', 'sab'];
    const dayIndex = date.getDay();
    return daysOfWeek[dayIndex];
}

export function mountTable(
    month: number,
    totalDaysInMonth: number,
    scale: number,
    workStartIn: number,
    daysWorking: number,
    daysResting: number,
    offset: number,
    caregivers: { name: string, observation: string }[],
    setState: Dispatch<SetStateAction<{
        date: string;
        name: string;
        observation: string;
    }[]>>
) {
    const tableItem: { date: string, name: string, observation: string }[] = [];
    let caregiverIteration = 0;
    let workingIteration = offset;
    let restingIteration = 0;

    [...Array(totalDaysInMonth)].map((_, index) => {
        const currentDate = new Date(new Date().getFullYear(), month, index + 1);
        const day = String(index + 1)
        const dateString = (day.length == 1 ? "0" + day : day) + " | " + getDayOfWeekName(currentDate)
        if (index + 1 < workStartIn) {
            tableItem.push({ date: dateString, name: "", observation: "" })
        } else {
            if (scale == 0 && caregivers.length == 1 && workingIteration < daysWorking) {
                tableItem.push({ date: dateString, ...caregivers[caregiverIteration] })
                workingIteration++
            } else if (scale == 0 && caregivers.length == 1 && workingIteration == daysWorking && restingIteration < daysResting) {
                tableItem.push({ date: dateString, name: "", observation: "" })
                restingIteration++

            }
            if (scale == 0 && caregivers.length == 1 && workingIteration == daysWorking && restingIteration == daysResting) {
                workingIteration = 0
                restingIteration = 0
            }
            if (scale == 0 && caregivers.length > 1 && workingIteration <= daysWorking) {
                workingIteration++
                tableItem.push({ date: dateString, ...caregivers[caregiverIteration] })
            }
            if (scale == 0 && caregivers.length > 1 && workingIteration == daysWorking) {
                caregiverIteration++
                workingIteration = 0
            }
            if (scale == 0 && caregivers.length > 1 && caregiverIteration == caregivers.length) {
                caregiverIteration = 0
            }
            //
            if (scale == 1 && caregivers.length == 1) {
                isWeekday(currentDate) ? tableItem.push({ date: dateString, ...caregivers[caregiverIteration] }) : tableItem.push({ date: dateString, name: "", observation: "" })
            }
            if (scale == 1 && caregivers.length > 1) {
                caregiverIteration++
                isWeekday(currentDate) ? tableItem.push({ date: dateString, ...caregivers[caregiverIteration] }) : tableItem.push({ date: dateString, name: "", observation: "" })
            }
            if (scale == 1 && caregivers.length > 1 && caregiverIteration == caregivers.length) {
                caregiverIteration = 0
            }
            //
            if (scale == 2 && caregivers.length == 1) {
                isWeekend(currentDate) ? tableItem.push({ date: dateString, ...caregivers[caregiverIteration] }) : tableItem.push({ date: dateString, name: "", observation: "" })
            }
            if (scale == 2 && caregivers.length > 1) {
                caregiverIteration++
                isWeekend(currentDate) ? tableItem.push({ date: dateString, ...caregivers[caregiverIteration] }) : tableItem.push({ date: dateString, name: "", observation: "" })
            }
            if (scale == 2 && caregivers.length > 1 && caregiverIteration == caregivers.length) {
                caregiverIteration = 0
            }
        }
    })
    setState(tableItem)
    return tableItem
}

export function Home2() {
    const [dataState, setData] = useState<Data>({
        house: { label: "casa", value: "", type: "input" },
        patient: { label: "paciente", value: "", type: "input" },
        month: { label: "mês", value: "0", type: "select", options: monthList },
        numberOfCaregivers: { label: "número de cuidadoras", value: "0", type: "select", options: numberOfCaregivers },
        scale: { label: "escala", value: "0", type: "select", options: ["normal", "dias da semana", "finais de semana"] },
        daysWorking: { label: "dias trabalhando", value: "0", type: "select", options: [...Array(7)].map((_, index) => `${index + 1}`) },
        daysResting: { label: "dias descansando", value: "0", type: "select", options: [...Array(8)].map((_, index) => `${index}`) },
        workStartIn: { label: "começou em", value: "0", type: "select", options: [] },
        offset: { label: "offset", value: "0", type: "select", options: [] }
    })

    const [caregivers, setCaregivers] = useState<{ name: string, observation: string }[]>([])

    const [tableData, setTableData] = useState<{ date: string, name: string, observation: string }[]>([])

    const totalDaysInSelectedMonth: number = useMemo(() => new Date(new Date().getFullYear(), Number(dataState.month.value), 0).getDate(), [dataState.month.value])

    useEffect(() => {
        changeDataOptions("workStartIn", [...Array(totalDaysInSelectedMonth)].map((_, index) => String(index + 1)))
    }, [totalDaysInSelectedMonth])

    useEffect(() => {
        const daysWorkingValue = Number((dataState.daysWorking as SelectData).options[Number(dataState.daysWorking.value)])
        changeDataOptions("offset", ["0", ...[...Array(daysWorkingValue - 1 || 0)].map((_, index) => String(index + 1))])
    }, [dataState.daysWorking.value])

    useEffect(() => {
        setCaregivers([...Array(Number(dataState.numberOfCaregivers.value) + 1)].map((value, index) => (caregivers[index] ? caregivers[index] : { name: "", observation: "" })))
    }, [dataState.numberOfCaregivers.value])

    useEffect(() => {
        mountTable(
            Number(dataState.month.value),
            totalDaysInSelectedMonth,
            Number(dataState.scale.value),
            Number((dataState.workStartIn as SelectData).options[Number(dataState.workStartIn.value)]),
            Number((dataState.daysWorking as SelectData).options[Number(dataState.daysWorking.value)]),
            Number((dataState.daysResting as SelectData).options[Number(dataState.daysResting.value)]),
            Number((dataState.offset as SelectData).options[Number(dataState.offset.value)]),
            caregivers,
            setTableData
        )
    }, [dataState, caregivers])

    const changeCaregiverData = (index: number, value: any) => {
        setCaregivers((lastData) => lastData.map((mapValue, mapIndex) => index == mapIndex ? value : mapValue))
    }

    const changeData = (key: string, value: any) => {
        setData((lastData) => ({ ...lastData, [key]: { ...lastData[key], value } }))
    }

    const changeDataOptions = (key: string, options: string[]) => {
        setData((lastData) => ({ ...lastData, [key]: { ...lastData[key], options } }))
    }

    return (<div className="w-full p-4">
        <div className='print:hidden'>
            {Object.keys(dataState).map((value, index) => {
                const dataStateValue = dataState[value]
                if (!isSelect(dataStateValue)) {
                    return (dataStateValue.type == "input" && <div key={index}>
                        <Label>{dataStateValue.label}</Label>
                        <Input value={dataStateValue.value} onChange={(e) => changeData(value, e.currentTarget.value)} />
                    </div>)
                }
                if (isSelect(dataStateValue)) {
                    if (value == "daysWorking" && dataState.scale.value != "0") return (<></>)
                    if (value == "daysResting" && dataState.scale.value != "0") return (<></>)
                    if (value == "daysResting" && Number(numberOfCaregivers[Number(dataState.numberOfCaregivers.value)]) > 1) return (<></>)
                    return (
                        <div key={index}>
                            {Number(dataState.numberOfCaregivers.value) == 1 && value == "daysResting"}
                            <Label>{dataStateValue.label}</Label>
                            <Select value={dataStateValue.value} onValueChange={(e) => { changeData(value, e) }}>
                                <SelectTrigger className="">
                                    <SelectValue placeholder={dataStateValue.label} />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        dataStateValue.options.map((value, index) => {
                                            return (<SelectItem key={index} value={String(index)}>{value}</SelectItem>)
                                        })
                                    }
                                </SelectContent>
                            </Select>
                        </div>)
                }
            })}
            <div>
            </div>
            <div className="flex flex-col gap-2">
                {caregivers.map((value, index) => (<div key={index}>
                    <Label>cuidadora {index + 1}</Label>
                    <Input value={value.name} onChange={(e) => changeCaregiverData(index, { name: e.currentTarget.value, observation: caregivers[index].observation })} />
                    <Label>observação cuidadora {index + 1}</Label>
                    <Input value={value.observation} onChange={(e) => changeCaregiverData(index, { name: caregivers[index].name, observation: e.currentTarget.value })} />
                </div>))}
            </div>
            <div>
                {
                    totalDaysInSelectedMonth
                }
            </div>
            <div>{caregivers.length}</div>
            {dataState.month.value}
        </div>

        <Table className='max-h-[841px] print:hidden'>
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">data</TableHead>
                    <TableHead>nome</TableHead>
                    <TableHead>observação</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    tableData.map((value, index) => (<TableRow key={index}>
                        <TableCell className="font-medium">{value.date}</TableCell>
                        <TableCell>
                            <Input
                                value={value.name}
                                onChange={(e) => {
                                    setTableData((data) => {
                                        const newData = [...data]
                                        newData.splice(index, 1, { ...data[index], name: e?.currentTarget?.value })
                                        return newData
                                    })
                                }} />
                        </TableCell>
                        <TableCell>
                            <Input
                                value={value.observation}
                                onChange={(e) => {
                                    setTableData((data) => {
                                        const newData = [...data]
                                        newData.splice(index, 1, { ...data[index], observation: e?.currentTarget?.value })
                                        return newData
                                    })
                                }} />
                        </TableCell>
                    </TableRow>))
                }
            </TableBody>
        </Table>
        <div className="mb-2 text-xl/none font-semibold">{(dataState.month as SelectData).options[Number(dataState.month.value)]}, {Number(dataState.month.value) + 1}/{new Date().getFullYear()}</div>
        <Table className='max-h-[841px] border-2'>
            <TableHeader className="border-b-2">
                <TableRow className="text-xl">
                    <TableHead className="w-[90px] border-r-2">data</TableHead>
                    <TableHead className="border-r-2">nome</TableHead>
                    <TableHead className="border-r-2">observação</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    tableData.map((value, index) => (<TableRow key={index} className={`${index % 2 && "bg-muted/50"} text-base/[16px] border-b-2`}>
                        <TableCell className="font-medium border-r-2 py-[0.4rem]">{value.date}</TableCell>
                        <TableCell className="border-r-2 py-[0.4rem]">{value.name} </TableCell>
                        <TableCell className="border-r-2 py-[0.4rem]">{value.observation}</TableCell>
                    </TableRow>))
                }
            </TableBody>
        </Table>
    </div>)
}