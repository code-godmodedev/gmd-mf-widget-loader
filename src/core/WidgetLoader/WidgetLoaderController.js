import {
  init as initMFRuntime,
  loadRemote,
  registerRemotes,
} from '@module-federation/enhanced/runtime';

// import remotes from "./../../data/remotes.prod.json";

class WidgetLoaderController {
  static shell;
  static appName;
  static remotes;
  static pluginCache = {};
  #scope;
  #filePath;
  #pluginId;

  constructor(pluginId) {
    const regex = /^[a-z][a-zA-Z\-_]+\/[a-zA-Z][a-zA-Z\-_]+$/g;
    const isValidPluginId = pluginId.search(regex);
    if (isValidPluginId >= 0) {
      this.#pluginId = pluginId.trim();
      const [_scope, _filePath] = this.#pluginId.split('/');
      this.#scope = _scope;
      this.#filePath = _filePath;
    } else {
      throw new Error(
        `the pluginId is invalid,it must follow the regex ${regex}`,
      );
    }
  }

  static init(appNameV, remotesV) {
    if (!!this.appName && this.appName === appNameV) {
      console.warn(`${appNameV} is already registered`);
    } else {
      if (!this.shell || !this.remotes) {
        this.appName = appNameV;
        this.remotes = remotesV;
        this.shell = initMFRuntime({
          name: appNameV || 'appHost',
          remotes: [],
        });
      }
    }
    return this.shell;
  }

  async loadRemoteHelper() {
    try {
      if (!WidgetLoaderController.pluginCache[this.#pluginId]) {
        if (!WidgetLoaderController.shell || !WidgetLoaderController.appName)
          throw new Error(
            'WidgetLoaderController not initialized: use WidgetLoaderController.init(<appName>)',
          );
        if (!this.#scope || !this.#filePath)
          throw new Error(
            'WidgetLoaderController not initialized with pluginId: use new WidgetLoaderController(<pluginId>)',
          );

        const remoteFromRepo = await WidgetLoaderController.resolveRemote(
          WidgetLoaderController.appName,
          this.#scope,
        );

        const remoteFromShell =
          WidgetLoaderController.shell.options?.remotes?.find(
            (v) => v.name === this.#scope && v.entry === remoteFromRepo.entry,
          );

        let remoteEntry = this.loadLocalRemote();

        const evalToRegisterRemote =
          !remoteFromShell ||
          (remoteEntry
            ? remoteFromShell.entry !== remoteEntry
            : remoteFromShell.entry !== remoteFromRepo.entry);

        if (evalToRegisterRemote) {
          console.log('remote not found in shell, registering remote');

          registerRemotes([
            {
              name: this.#scope,
              entry: remoteEntry || remoteFromRepo.entry,
            },
          ]);
        }

        console.log('loading remote component', this.#pluginId);
        WidgetLoaderController.pluginCache[this.#pluginId] = {
          remote: loadRemote(this.#pluginId),
          instance: this,
        };
      }
      return WidgetLoaderController.pluginCache[this.#pluginId].remote;
    } catch (e) {
      console.log('error caught');
      console.error(e);
      throw e;
    }
  }

  static async resolveRemote(appName, scope) {
    if (!WidgetLoaderController.remotes)
      throw new Error(`failed to load remotes for ${appName}`);

    return new Promise((resolve, reject) => {
      const app = WidgetLoaderController.remotes.find((r) => r.app === appName);
      if (!app)
        reject(
          new Error(`couldn't find the app ${appName} in the remotes repo`),
        );

      const remote = app.remotes?.find((r) => r.scope === scope);
      if (!remote)
        reject(
          new Error(
            `couldn't find the remote from scope ${scope} in th app ${appName}`,
          ),
        );

      resolve(remote);
    });
  }

  loadLocalRemote() {
    const localRemoteEntry = localStorage.getItem(this.#pluginId);

    if (localRemoteEntry) {
      console.log(`local remote entry found at ${localRemoteEntry}`);
    }

    return localRemoteEntry;
  }
}

const createWidgetLoaderController = (pluginId) => {
  return (
    WidgetLoaderController.pluginCache[pluginId]?.instance ||
    new WidgetLoaderController(pluginId)
  );
};

export { WidgetLoaderController, createWidgetLoaderController };
