import React from 'react';
import useWidgetLoader from './useWidgetLoader';

export default function WidgetLoader({ pluginId, Loader, Error }) {
  const { RComponent, error } = useWidgetLoader(pluginId);
  if (error) {
    return Error || <div>Failed to load component</div>;
  }
  return RComponent || Loader || <div>{`Loading ${pluginId}...`}</div>;
}
