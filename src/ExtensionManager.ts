import * as vscode from 'vscode';

/**
 * According to the `contributes.configuration.properties["easy-toggle-settings.` in package.json
 */
export const EXTENSION_NAME = 'easy-toggle-settings';

const ENABLED_PROPERTY = `${EXTENSION_NAME}.enabled`;
const ITEMS_PROPERTY = `${EXTENSION_NAME}.items`;

/**
 * According to the `contributes.commands` in package.json
 */
export const TOGGLE_COMMAND = `${EXTENSION_NAME}.toggle`;

const OPEN_SETTINGS_ACTION = 'Open Settings';

/**
 * Represents a toggle setting in the extension.
 */
export interface ToggleSetting {
  /** The vscode property to toggle */
  property: string;
  /** The values to cycle through */
  values: any[];
  /** The icon to display in the status bar */
  icon: string;
  /** If true, the setting will be toggled at the workspace level */
  isWorkspace?: boolean;
  /** If the setting reaches this value, the status bar item will appear grayed out */
  disabledValue?: any;
}

/**
 * Compare setting values by content, so arrays and objects are matched correctly.
 */
export function isSameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Get the value that follows `currentValue` in `values`, wrapping around at the end.
 * If `currentValue` is not one of the `values`, the first value is returned.
 */
export function getNextValue(values: unknown[], currentValue: unknown): unknown {
  const currentIndex = values.findIndex(value => isSameValue(value, currentValue));
  return values[(currentIndex + 1) % values.length];
}

/**
 * Format a setting value for display, e.g. `"none"`, `true`, `[80]`.
 */
function formatValue(value: unknown): string {
  return String(JSON.stringify(value));
}

/**
 * Get the `property` from the toggle command arguments, or `undefined` if the arguments are invalid.
 */
function getPropertyArg(args: unknown): string | undefined {
  if (typeof args === 'object' && args !== null && 'property' in args) {
    const { property } = args;
    if (typeof property === 'string' && property.trim() !== '') {
      return property;
    }
  }
  return undefined;
}

/**
 * Represents a disposable object we need to manage.
 */
type DisposableLike = vscode.Disposable | vscode.StatusBarItem;

export class ExtensionManager {

  private static instance: ExtensionManager;

  private context: vscode.ExtensionContext;
  private enabled: boolean;

  /**
   * Items displayed in the status bar.
   *
   * @remarks
   * - The map key is the command ID
   * - The value contains ToggleSetting, the status bar item and disposables associated with it
   */
  private statusBarItems: Map<string, {item: ToggleSetting, statusBarItem: vscode.StatusBarItem, disposables: DisposableLike[] }> = new Map();

  private itemsChangeSubscription?: vscode.Disposable;

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.enabled = this.getEnabledFromConfig();

    if (this.enabled) {
      this.activate();
    }

    // status bar items, their commands and the items listener are recreated at runtime,
    // so they are tracked internally and disposed all at once when the extension is deactivated
    context.subscriptions.push(new vscode.Disposable(() => this.deactivate()));

    // generic command to cycle a configured setting from the Command Palette or a keybinding
    context.subscriptions.push(vscode.commands.registerCommand(TOGGLE_COMMAND, (args?: unknown) => this.runToggleCommand(args)));

    // monitor the enabled property
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration(ENABLED_PROPERTY)) {
        const newValue = this.getEnabledFromConfig();
        if (this.enabled !== newValue) {
          this.toggleExtension(newValue);
        }
      };
    }));
  }

  static initialize(context: vscode.ExtensionContext): ExtensionManager {
    if (!ExtensionManager.instance) {
      ExtensionManager.instance = new ExtensionManager(context);
    }
    return ExtensionManager.instance;
  }

  static getInstance(): ExtensionManager {
    return ExtensionManager.instance;
  }

  public toggleExtension(enabled: boolean) {
    this.enabled = enabled;
    if (enabled) {
      this.activate();
      vscode.window.showInformationMessage(`Extension ${EXTENSION_NAME} is enabled.`);
    } else {
      this.deactivate();
      vscode.window.showInformationMessage(`Extension ${EXTENSION_NAME} is disabled.`);
    }
  }

  private activate() {
    this.createAllStatusBarItems();

    this.itemsChangeSubscription = vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration(ITEMS_PROPERTY)) {
        this.createAllStatusBarItems();
        return;
      }
      // refresh items whose setting was changed outside the extension (settings.json, Settings UI, etc.)
      this.statusBarItems.forEach(({ item, statusBarItem }) => {
        if (event.affectsConfiguration(item.property)) {
          this.updateStatusBarItem(item, statusBarItem);
        }
      });
    });
  }

  private deactivate() {
    this.itemsChangeSubscription?.dispose();
    this.itemsChangeSubscription = undefined;
    this.removeAllStatusBarItems();
  }

  private getEnabledFromConfig(): boolean {
    return vscode.workspace.getConfiguration().get(ENABLED_PROPERTY, true);
  }

  private createAllStatusBarItems(): void {
    this.removeAllStatusBarItems();

    const duplicateProperties: string[] = [];

    this.getAllToggles().forEach(toggle => {
      if (!this.exists(toggle.property)) {
        const item = this.createStatusBarItem(toggle);
        this.updateStatusBarItem(toggle, item);
      } else {
        duplicateProperties.push(toggle.property);
      }
    });

    if (duplicateProperties.length > 0) {
      const msg = duplicateProperties.join('; ');
      vscode.window.showWarningMessage(`The following properties are duplicated: ${msg}. Only the first occurrence of each will be considered.`);
    }
  }

  private removeAllStatusBarItems() {
    for (const key of Array.from(this.statusBarItems.keys())) {
      this.removeStatusBarItem(key);
    }
  }

  private removeStatusBarItem(commandId: string) {
    const disposables = this.statusBarItems.get(commandId)?.disposables;
    if (disposables) {
      disposables.forEach(d => d.dispose());
      this.statusBarItems.delete(commandId);
    }
  }

  private getAllToggles(): ToggleSetting[] {
    return vscode.workspace.getConfiguration().get(ITEMS_PROPERTY) || [];
  }

  private createStatusBarItem(setting: ToggleSetting): vscode.StatusBarItem {
    // a unique id per item lets users hide each one individually from the status bar context menu
    const statusBarItem = vscode.window.createStatusBarItem(setting.property, vscode.StatusBarAlignment.Right, 100);
    statusBarItem.name = `Easy Toggle Settings: ${setting.property}`;
    statusBarItem.command = ExtensionManager.getCommandId(setting.property);

    const command = vscode.commands
      .registerCommand(statusBarItem.command, () => this.cycleSetting(setting));

    this.statusBarItems.set(statusBarItem.command, {item: setting, statusBarItem, disposables: [ statusBarItem, command ]});
    return statusBarItem;
  }

  /**
   * Build the command ID for the toggle setting.
   */
  public static getCommandId(toggleProperty: string): string {
    return `${EXTENSION_NAME}.${toggleProperty}`;
  }

  /**
   * Cycle the toggle setting to its next value.
   *
   * @remarks
   * The status bar item is refreshed by the configuration change listener.
   */
  private async cycleSetting(setting: ToggleSetting): Promise<void> {
    const config = vscode.workspace.getConfiguration();
    const newValue = getNextValue(setting.values, config.get(setting.property));
    const target = setting.isWorkspace ? vscode.ConfigurationTarget.Workspace : vscode.ConfigurationTarget.Global;

    try {
      await config.update(setting.property, newValue, target);
    } catch (err) {
      const msg = `Failed to update setting ${setting.property}: ${err}`;
      console.error(msg, err);
      vscode.window.showErrorMessage(msg);
    }
  }

  /**
   * Handle the generic toggle command.
   *
   * @remarks
   * - Without arguments (e.g. from the Command Palette), a Quick Pick lets the user choose the setting
   * - With `{ "property": "<setting name>" }` (e.g. from a keybinding), that configured setting is cycled
   */
  private async runToggleCommand(args?: unknown): Promise<void> {
    if (!this.enabled) {
      vscode.window.showWarningMessage(`Extension ${EXTENSION_NAME} is disabled.`);
      return;
    }

    if (args === undefined) {
      const setting = await this.pickSetting();
      if (setting) {
        await this.cycleSetting(setting);
      }
      return;
    }

    const property = getPropertyArg(args);
    if (!property) {
      vscode.window.showErrorMessage(`Invalid arguments for ${TOGGLE_COMMAND}. Expected: { "property": "<setting name>" }.`);
      return;
    }

    const setting = this.statusBarItems.get(ExtensionManager.getCommandId(property))?.item;
    if (!setting) {
      this.showMessageWithOpenSettings(
        vscode.window.showWarningMessage(`The property ${property} is not configured in ${ITEMS_PROPERTY}.`, OPEN_SETTINGS_ACTION)
      );
      return;
    }

    await this.cycleSetting(setting);
  }

  /**
   * Show a Quick Pick with the configured settings, including their current and next values.
   */
  private async pickSetting(): Promise<ToggleSetting | undefined> {
    const settings = this.allStatusBarItems;
    if (settings.length === 0) {
      this.showMessageWithOpenSettings(
        vscode.window.showInformationMessage(`No settings configured in ${ITEMS_PROPERTY}.`, OPEN_SETTINGS_ACTION)
      );
      return undefined;
    }

    const config = vscode.workspace.getConfiguration();
    const picks = settings.map(setting => {
      const value = config.get(setting.property);
      const suffix = setting.isWorkspace ? ' (workspace)' : '';
      return {
        label: `$(${setting.icon}) ${setting.property}`,
        description: `${formatValue(value)} → ${formatValue(getNextValue(setting.values, value))}${suffix}`,
        setting,
      };
    });

    const picked = await vscode.window.showQuickPick(picks, {
      title: 'Easy Toggle Settings',
      placeHolder: 'Select a setting to toggle',
    });
    return picked?.setting;
  }

  /**
   * Open the extension settings if the user chooses the action of the message.
   *
   * @remarks
   * Not awaited by the callers, so a command does not stay pending until the notification is dismissed.
   */
  private showMessageWithOpenSettings(message: Thenable<string | undefined>): void {
    message.then(action => {
      if (action === OPEN_SETTINGS_ACTION) {
        vscode.commands.executeCommand('workbench.action.openSettings', ITEMS_PROPERTY);
      }
    });
  }

  private updateStatusBarItem(setting: ToggleSetting, item: vscode.StatusBarItem) {
    const config = vscode.workspace.getConfiguration();
    const value = config.get(setting.property);
    const suffix = setting.isWorkspace ? ' (workspace)' : '';
    item.text = `$(${setting.icon})`;
    item.tooltip = `${setting.property}: ${value}${suffix}`;

    if (setting.disabledValue !== undefined && isSameValue(value, setting.disabledValue)) {
      item.color = new vscode.ThemeColor('disabledForeground');
    } else {
      item.color = undefined;
    }

    item.show();
  }

  get totalStatusBarItems(): number {
    return this.statusBarItems.size;
  }

  get allStatusBarItems(): ToggleSetting[] {
    return Array.from(this.statusBarItems.values()).map(i => i.item);
  }

  get totalSubscriptions(): number {
    return this.context.subscriptions.length;
  }

  getStatusBarItem(property: string): vscode.StatusBarItem | undefined {
    return this.statusBarItems.get(ExtensionManager.getCommandId(property))?.statusBarItem;
  }

  private exists(property: string): boolean {
    const commandId = ExtensionManager.getCommandId(property);
    return this.statusBarItems.has(commandId);
  }

}
