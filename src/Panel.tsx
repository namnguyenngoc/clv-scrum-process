import React, { ReactElement, useEffect, useState } from 'react';
import { APP_COLLAPSE_WIDTH, APP_EXTEND_WIDTH, APP_EXTEND_HEIGHT, APP_COLLAPSE_HEIGHT} from './const';
import Button from './components/Button';
import MgmtProcess from './components/MgmtProcess';

export default function Panel({ onWidthChange, initialEnabled }: { onWidthChange: (value: number) => void, initialEnabled: boolean }): ReactElement {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [sidePanelWidth, setSidePanelWidth] = useState(enabled ? APP_EXTEND_WIDTH: APP_COLLAPSE_WIDTH);
  const [sidePanelHeight, setSidePanelHeight] = useState(enabled ? APP_EXTEND_HEIGHT: APP_COLLAPSE_HEIGHT);
  const [tabIndex, setTabIndex] = useState(0);
  const [showWorkList, setShowWorkList] = useState(false);

  function handleOnToggle(enabled: boolean) {
    const value = enabled ? APP_EXTEND_WIDTH : APP_COLLAPSE_WIDTH;
    const valueH = enabled ? APP_EXTEND_HEIGHT : APP_COLLAPSE_HEIGHT;
    setSidePanelWidth(value);
    setSidePanelHeight(valueH);
    onWidthChange(value);

    window['chrome'].storage?.local.set({SCRUM_PROCESS: enabled});
    let a = window['chrome'];
    console.log("window['chrome']",window['chrome']);
  }

  function openPanel(force?: boolean) {
    const newValue = force || !enabled;
    setEnabled(newValue);
    handleOnToggle(newValue);
    setShowWorkList(!newValue);
  }

  const handleSearch = (condition) => {
    // Perform search logic here based on the given condition
    // and update the searchResults state with the result
  
  };
  const openLogWork = (force?: boolean) => {
    setSidePanelWidth(1000); 
    const newValue = force || !enabled;
    setShowWorkList(newValue);
  }
  return (
    <div
      style={{
        width: sidePanelWidth - 5,
        height: sidePanelHeight,
        right: 17,
        top: 214,
      }}
      className={!enabled ? "absolute bottom-0 z-max bg-[#F5F8FA] ease-in-out duration-300 overflow-hidden grid grid-flow-row gap-1 main-body border-hidden" 
        : "absolute bottom-0 z-max bg-[#F5F8FA] ease-in-out duration-300 overflow-hidden gap-1 main-body"}
    >
      
      <div className='main-layout grid grid-flow-row gap-1'
        style={{
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 8,
          paddingBottom: 8
        }}
      >
          <MgmtProcess 
            onSearch={handleSearch} />
          
      </div>
      <div className="absolute bottom-0 left-0 w-[50px] z-10 flex justify-center items-center p-1 custom-button-expand">
        <Button active={enabled} onClick={() => openPanel()}>
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={
                  enabled
                    ? 'M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25'
                    : 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15'
                }
              />
            </svg>
          </span>
         
        </Button>
       
      </div>
    </div>
  );
}
