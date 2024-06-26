import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DevTools from './DevTools/DevTools';
import { WidgetLoaderController } from './WidgetLoader/WidgetLoaderController';

export default function withDevTools(Component) {
  return (props) => {
    const { devtoolsProps, app, remotes, ...restProps } = props;

    const [widgetLoaderInitialized, setWidgetLoaderInitialized] =
      useState(false);

    useEffect(() => {
      if (!widgetLoaderInitialized) {
        const initialized = WidgetLoaderController.init(app, remotes);
        setWidgetLoaderInitialized(!!initialized);
      }
    }, [app]);

    return (
      widgetLoaderInitialized && (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Component {...restProps} />} />
            <Route path="/devtools" element={<DevTools {...devtoolsProps} />} />
          </Routes>
        </BrowserRouter>
      )
    );
  };
}
