'use client';

import clsx from "clsx";

export interface StatisticNumbersItem {
  title: string,
  value: number,
  icon: JSX.Element,
}

const formatter = new Intl.NumberFormat('en-US');

function getGridCols(cols: number): string {
  return "grid-cols-" + cols;
}

export function StatisticNumbers({ items, className }: { items: StatisticNumbersItem[], className?: string }) {
  return (
    <div className={clsx(
      "w-full grid grid-cols-2 xl:grid-cols-4 bg-white rounded-lg border",
      items.length > 0 ? getGridCols(items.length) : "grid-cols-1",
      className || ""
    )}>
      { items.map((item, index: number) => (
        <div key={index} className="py-4 pl-4">
          <div className="border-r pr-4">
            <div className="flex justify-between flex-nowrap">
              <div className="flex-grow">
                <h2 className="font-[600] text-[28px] leading-[42px]">{formatter.format(item.value)}</h2>
                <p className="font-[400] text-[16px] leading-[24px]">{item.title}</p>
              </div>
              <div>
                <div className="text-sm text-blue-500 p-2 aspect-square rounded-lg shadow">
                  {item.icon}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}