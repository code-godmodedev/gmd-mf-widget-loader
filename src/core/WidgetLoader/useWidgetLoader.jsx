import { useState, useEffect } from 'react';
import { createWidgetLoaderController } from './WidgetLoaderController';

export default function useWidgetLoader(pluginId) {
  const [RComponent, setRComponent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const widgetLoaderHelper = createWidgetLoaderController(pluginId);
    const loadRemoteHelperAsync = async () => {
      try {
        const { default: Component } =
          await widgetLoaderHelper.loadRemoteHelper();
        if (!Component)
          return setError(
            new Error(`Failed to load remote component from ${pluginId}`),
          );
        setRComponent(Component);
      } catch (e) {
        console.error(e);
        const customeError = new Error(
          `Failed to load remote component from ${pluginId}`,
        );
        setError(customeError);
        throw [customeError, e];
      }
    };
    loadRemoteHelperAsync();
  }, [pluginId]);

  return { RComponent, error };
}
