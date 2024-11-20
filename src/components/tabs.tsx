'use client'

import clsx from 'clsx';
import { createContext, Fragment, useCallback, useContext, useMemo, useState } from "react";

export interface TabNavTabsProp {
  label: string;
  key: string;
}

export const TabsContext = createContext<{
  selectedKey?: string;
}>({})

export function TabContent({
  name,
  children,
  className,
  ...props
} : Readonly<{
  name: string;
  className?: string;
  children?: React.ReactNode;
}>) {
  const { selectedKey } = useContext(TabsContext);
  return (
    <Fragment>
      {name === selectedKey && (
        <div className={className} {...props}>
          {children}
        </div>
      )}
    </Fragment>
  )
}

type TabContentComponent = typeof TabContent;

export function AuthTabNav({
  tabs = [],
  defaultSelectedTab,
  selectedTab,
  children,
  onSelectedTab,
}: Readonly<{
  tabs: TabNavTabsProp[];
  defaultSelectedTab?: string;
  selectedTab?: string;
  children: React.ReactElement<TabContentComponent>|React.ReactElement<TabContentComponent>[];
  onSelectedTab?: (tab?: string, index?: number) => void;
}>) {

  const [selTab, setSelTab] = useState<string|undefined>(defaultSelectedTab || [...tabs].shift()?.key);
  const selectTab = useMemo(() => !selectedTab ? selTab : selectedTab, [selTab, selectedTab])
  const handleSelectedTab = useMemo(() => typeof (onSelectedTab) === "function" ? onSelectedTab : setSelTab, [onSelectedTab])
  const handleSelectTab = useCallback((tab: string, index: number) => {
    if (!selectedTab && typeof (onSelectedTab) === "function") {
      setSelTab(tab)
    } else {
      if (selTab !== tab && !selectedTab) {
        setSelTab(tab)
      }
      handleSelectedTab(tab, index);
    }
  }, [handleSelectedTab, setSelTab, onSelectedTab, selectedTab, selTab])

  const displayNavTabs = useCallback(() => (
    tabs.map(({key,label}, index) => (
      <div key={key} onClick={() => handleSelectTab(key, index)} className={`cursor-pointer mt-10 *:min-w-[150px] h-[50px] relative hover:drop-shadow ${selectTab === key ? 'text-gray-500 hover:text-gray-800' : 'text-[#00823E] hover:text-[#335644]'}`}>
        <div className="relative">
          {label}
          { selectTab === key && <div className="absolute left-1/4 -bottom-1/2 w-1/2 h-[7px] bg-[#00823E]" /> }
        </div>
      </div>
    ))
  ), [selectTab, handleSelectTab, tabs])

  return (
    <TabsContext.Provider value={{
      selectedKey: selectTab
    }}>
      <div className="max-w-[458px] mt-4 md:mt-0">
        <div className="min-h-[200px] rounded-[20px] drop-shadow-xl bg-[#F5F5F5]">
          <div className="max-w-full h-full overflow-x-auto">
            <div className="h-[120px] min-w-full *:capitalize *:text-center *:w-full flex flex-row text-[28px] font-[600] leading-[34.13px]">
              {displayNavTabs()}
            </div>
          </div>
        </div>
        <div className="min-h-[542px] -mt-[90px] bg-white drop-shadow-2xl border rounded-[20px]">
          {children}
        </div>
      </div>
    </TabsContext.Provider>
  )
}


export function TabNav({
  tabs = [],
  defaultSelectedTab,
  selectedTab,
  className,
  children,
  onSelectedTab,
}: Readonly<{
  tabs: TabNavTabsProp[];
  defaultSelectedTab?: string;
  selectedTab?: string;
  className?: string;
  children: React.ReactElement<TabContentComponent>|React.ReactElement<TabContentComponent>[];
  onSelectedTab?: (tab?: string, index?: number) => void;
}>) {

  const [selTab, setSelTab] = useState<string|undefined>(defaultSelectedTab || [...tabs].shift()?.key);
  const selectTab = useMemo(() => !selectedTab ? selTab : selectedTab, [selTab, selectedTab])
  const handleSelectedTab = useMemo(() => typeof (onSelectedTab) === "function" ? onSelectedTab : setSelTab, [onSelectedTab])
  const handleSelectTab = useCallback((tab: string, index: number) => {
    if (!selectedTab && typeof (onSelectedTab) === "function") {
      setSelTab(tab)
    } else {
      if (selTab !== tab && !selectedTab) {
        setSelTab(tab)
      }
      handleSelectedTab(tab, index);
    }
  }, [handleSelectedTab, setSelTab, onSelectedTab, selectedTab, selTab])

  const displayNavTabs = useCallback(() => (
    tabs.map(({key,label}, index) => (
      <div key={key} onClick={() => handleSelectTab(key, index)} className={`cursor-pointer mt-10 *:min-w-[150px] h-[50px] relative hover:drop-shadow ${selectTab === key ? 'text-gray-500 hover:text-gray-800' : 'text-[#00823E] hover:text-[#335644]'}`}>
        <div className="relative">
          {label}
          { selectTab === key && <div className="absolute left-1/4 -bottom-1/2 w-1/2 h-[7px] bg-[#00823E]" /> }
        </div>
      </div>
    ))
  ), [selectTab, handleSelectTab, tabs])

  return (
    <TabsContext.Provider value={{
      selectedKey: selectTab
    }}>
      <div className={clsx("mt-4 md:mt-0", className)}>
        <div className="min-h-[100px] rounded-t-[20px] drop-shadow-xl bg-white border">
          <div className="max-w-full h-full overflow-x-auto">
            <div className="h-[120px] min-w-full *:capitalize *:text-center *:w-full *:border-r flex flex-row text-[28px] font-[600] leading-[34.13px]">
              {displayNavTabs()}
            </div>
          </div>
        </div>
        <div className="min-h-[542px] -mt-4 bg-white drop-shadow-2xl border rounded-[20px]">
          {children}
        </div>
      </div>
    </TabsContext.Provider>
  )
}

const Tabs = {
  TabsContext,
  TabContent,
  TabNav,
  AuthTabNav,
}

export default Tabs