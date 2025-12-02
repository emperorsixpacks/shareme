
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```sh
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const SHELL: string;
	export const IMSETTINGS_INTEGRATE_DESKTOP: string;
	export const npm_command: string;
	export const npm_config_userconfig: string;
	export const COLORTERM: string;
	export const HYPRLAND_CMD: string;
	export const npm_config_cache: string;
	export const XDG_SESSION_PATH: string;
	export const NVM_INC: string;
	export const HISTCONTROL: string;
	export const XDG_BACKEND: string;
	export const HOSTNAME: string;
	export const HISTSIZE: string;
	export const NODE: string;
	export const npm_config_ignore_scripts: string;
	export const npm_package_scripts_check_watch: string;
	export const DOTNET_ROOT: string;
	export const SSH_AUTH_SOCK: string;
	export const npm_package_private: string;
	export const COLOR: string;
	export const npm_config_local_prefix: string;
	export const npm_config_argv: string;
	export const HOMEBREW_PREFIX: string;
	export const XMODIFIERS: string;
	export const npm_config_bin_links: string;
	export const DESKTOP_SESSION: string;
	export const SSH_AGENT_PID: string;
	export const HL_INITIAL_WORKSPACE_TOKEN: string;
	export const KITTY_PID: string;
	export const npm_config_globalconfig: string;
	export const XCURSOR_SIZE: string;
	export const GPG_TTY: string;
	export const EDITOR: string;
	export const GOBIN: string;
	export const XDG_SEAT: string;
	export const PWD: string;
	export const npm_config_save_prefix: string;
	export const npm_package_devDependencies_vite: string;
	export const LOGNAME: string;
	export const XDG_SESSION_DESKTOP: string;
	export const XDG_SESSION_TYPE: string;
	export const npm_package_readmeFilename: string;
	export const npm_config_init_module: string;
	export const npm_package_scripts_build: string;
	export const _: string;
	export const SDL_VIDEO_MINIMIZE_ON_FOCUS_LOSS: string;
	export const KITTY_PUBLIC_KEY: string;
	export const FZF_DEFAULT_COMMAND: string;
	export const XDG_GREETER_DATA_DIR: string;
	export const HARDWARE_PLATFORM: string;
	export const GDM_LANG: string;
	export const HOME: string;
	export const SSH_ASKPASS: string;
	export const npm_config_version_git_tag: string;
	export const LANG: string;
	export const npm_package_devDependencies_typescript: string;
	export const _JAVA_AWT_WM_NONREPARENTING: string;
	export const LS_COLORS: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const npm_config_init_license: string;
	export const npm_package_version: string;
	export const WAYLAND_DISPLAY: string;
	export const npm_package_scripts_prepare: string;
	export const npm_config_version_commit_hooks: string;
	export const KITTY_WINDOW_ID: string;
	export const XDG_SEAT_PATH: string;
	export const GOROOT: string;
	export const IMSETTINGS_MODULE: string;
	export const INIT_CWD: string;
	export const DOTNET_BUNDLE_EXTRACT_BASE_DIR: string;
	export const STEAM_FRAME_FORCE_CLOSE: string;
	export const npm_package_scripts_preview: string;
	export const INFOPATH: string;
	export const npm_lifecycle_script: string;
	export const npm_package_description: string;
	export const MOZ_GMP_PATH: string;
	export const NVM_DIR: string;
	export const npm_config_version_tag_prefix: string;
	export const npm_package_devDependencies__sveltejs_vite_plugin_svelte: string;
	export const npm_config_npm_version: string;
	export const npm_package_devDependencies_svelte_check: string;
	export const XDG_SESSION_CLASS: string;
	export const ANDROID_HOME: string;
	export const TERM: string;
	export const TERMINFO: string;
	export const npm_package_name: string;
	export const FZF_CTRL_T_COMMAND: string;
	export const npm_config_prefix: string;
	export const LESSOPEN: string;
	export const npm_package_type: string;
	export const USER: string;
	export const NDK_HOME: string;
	export const FZF_ALT_C_COMMAND: string;
	export const HOMEBREW_CELLAR: string;
	export const HYPRLAND_INSTANCE_SIGNATURE: string;
	export const DISPLAY: string;
	export const npm_lifecycle_event: string;
	export const SHLVL: string;
	export const npm_config_version_git_sign: string;
	export const NVM_CD_FLAGS: string;
	export const MOZ_ENABLE_WAYLAND: string;
	export const npm_config_version_git_message: string;
	export const HOMEBREW_REPOSITORY: string;
	export const XDG_VTNR: string;
	export const XDG_SESSION_ID: string;
	export const npm_config_user_agent: string;
	export const npm_execpath: string;
	export const npm_package_devDependencies__sveltejs_adapter_auto: string;
	export const npm_package_devDependencies_svelte: string;
	export const XDG_RUNTIME_DIR: string;
	export const npm_config_strict_ssl: string;
	export const DEBUGINFOD_URLS: string;
	export const npm_package_json: string;
	export const DEBUGINFOD_IMA_CERT_PATH: string;
	export const npm_package_scripts_dev: string;
	export const GTK3_MODULES: string;
	export const XDG_DATA_DIRS: string;
	export const npm_package_scripts_check: string;
	export const npm_config_noproxy: string;
	export const PATH: string;
	export const npm_config_node_gyp: string;
	export const GDMSESSION: string;
	export const npm_package_devDependencies__sveltejs_kit: string;
	export const PHP_INI_SCAN_DIR: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const npm_config_global_prefix: string;
	export const NVM_BIN: string;
	export const MAIL: string;
	export const npm_config_registry: string;
	export const npm_config_ignore_optional: string;
	export const KITTY_INSTALLATION_DIR: string;
	export const npm_node_execpath: string;
	export const npm_config_engine_strict: string;
	export const OLDPWD: string;
	export const HYPRCURSOR_SIZE: string;
	export const npm_config_init_version: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		SHELL: string;
		IMSETTINGS_INTEGRATE_DESKTOP: string;
		npm_command: string;
		npm_config_userconfig: string;
		COLORTERM: string;
		HYPRLAND_CMD: string;
		npm_config_cache: string;
		XDG_SESSION_PATH: string;
		NVM_INC: string;
		HISTCONTROL: string;
		XDG_BACKEND: string;
		HOSTNAME: string;
		HISTSIZE: string;
		NODE: string;
		npm_config_ignore_scripts: string;
		npm_package_scripts_check_watch: string;
		DOTNET_ROOT: string;
		SSH_AUTH_SOCK: string;
		npm_package_private: string;
		COLOR: string;
		npm_config_local_prefix: string;
		npm_config_argv: string;
		HOMEBREW_PREFIX: string;
		XMODIFIERS: string;
		npm_config_bin_links: string;
		DESKTOP_SESSION: string;
		SSH_AGENT_PID: string;
		HL_INITIAL_WORKSPACE_TOKEN: string;
		KITTY_PID: string;
		npm_config_globalconfig: string;
		XCURSOR_SIZE: string;
		GPG_TTY: string;
		EDITOR: string;
		GOBIN: string;
		XDG_SEAT: string;
		PWD: string;
		npm_config_save_prefix: string;
		npm_package_devDependencies_vite: string;
		LOGNAME: string;
		XDG_SESSION_DESKTOP: string;
		XDG_SESSION_TYPE: string;
		npm_package_readmeFilename: string;
		npm_config_init_module: string;
		npm_package_scripts_build: string;
		_: string;
		SDL_VIDEO_MINIMIZE_ON_FOCUS_LOSS: string;
		KITTY_PUBLIC_KEY: string;
		FZF_DEFAULT_COMMAND: string;
		XDG_GREETER_DATA_DIR: string;
		HARDWARE_PLATFORM: string;
		GDM_LANG: string;
		HOME: string;
		SSH_ASKPASS: string;
		npm_config_version_git_tag: string;
		LANG: string;
		npm_package_devDependencies_typescript: string;
		_JAVA_AWT_WM_NONREPARENTING: string;
		LS_COLORS: string;
		XDG_CURRENT_DESKTOP: string;
		npm_config_init_license: string;
		npm_package_version: string;
		WAYLAND_DISPLAY: string;
		npm_package_scripts_prepare: string;
		npm_config_version_commit_hooks: string;
		KITTY_WINDOW_ID: string;
		XDG_SEAT_PATH: string;
		GOROOT: string;
		IMSETTINGS_MODULE: string;
		INIT_CWD: string;
		DOTNET_BUNDLE_EXTRACT_BASE_DIR: string;
		STEAM_FRAME_FORCE_CLOSE: string;
		npm_package_scripts_preview: string;
		INFOPATH: string;
		npm_lifecycle_script: string;
		npm_package_description: string;
		MOZ_GMP_PATH: string;
		NVM_DIR: string;
		npm_config_version_tag_prefix: string;
		npm_package_devDependencies__sveltejs_vite_plugin_svelte: string;
		npm_config_npm_version: string;
		npm_package_devDependencies_svelte_check: string;
		XDG_SESSION_CLASS: string;
		ANDROID_HOME: string;
		TERM: string;
		TERMINFO: string;
		npm_package_name: string;
		FZF_CTRL_T_COMMAND: string;
		npm_config_prefix: string;
		LESSOPEN: string;
		npm_package_type: string;
		USER: string;
		NDK_HOME: string;
		FZF_ALT_C_COMMAND: string;
		HOMEBREW_CELLAR: string;
		HYPRLAND_INSTANCE_SIGNATURE: string;
		DISPLAY: string;
		npm_lifecycle_event: string;
		SHLVL: string;
		npm_config_version_git_sign: string;
		NVM_CD_FLAGS: string;
		MOZ_ENABLE_WAYLAND: string;
		npm_config_version_git_message: string;
		HOMEBREW_REPOSITORY: string;
		XDG_VTNR: string;
		XDG_SESSION_ID: string;
		npm_config_user_agent: string;
		npm_execpath: string;
		npm_package_devDependencies__sveltejs_adapter_auto: string;
		npm_package_devDependencies_svelte: string;
		XDG_RUNTIME_DIR: string;
		npm_config_strict_ssl: string;
		DEBUGINFOD_URLS: string;
		npm_package_json: string;
		DEBUGINFOD_IMA_CERT_PATH: string;
		npm_package_scripts_dev: string;
		GTK3_MODULES: string;
		XDG_DATA_DIRS: string;
		npm_package_scripts_check: string;
		npm_config_noproxy: string;
		PATH: string;
		npm_config_node_gyp: string;
		GDMSESSION: string;
		npm_package_devDependencies__sveltejs_kit: string;
		PHP_INI_SCAN_DIR: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		npm_config_global_prefix: string;
		NVM_BIN: string;
		MAIL: string;
		npm_config_registry: string;
		npm_config_ignore_optional: string;
		KITTY_INSTALLATION_DIR: string;
		npm_node_execpath: string;
		npm_config_engine_strict: string;
		OLDPWD: string;
		HYPRCURSOR_SIZE: string;
		npm_config_init_version: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
