import * as vscode from 'vscode';
import * as assert from 'assert';
import { EXTENSION_NAME, ExtensionManager, TOGGLE_COMMAND, ToggleSetting, getNextValue } from '../ExtensionManager';
import * as sinon from 'sinon';

suite('Extension Test Suite', () => {

  let extension: TestExtensionManager;

  suiteSetup(async () => {
    extension = new TestExtensionManager();
    vscode.window.showInformationMessage('Start all tests.');
  });

  setup(async () => {
    await extension.clearAllTogglesFromConf();
  });

  teardown(() => {
    // https://sinonjs.org/releases/latest/sandbox/#default-sandbox
    sinon.restore(); // cleanup, restore any mock, spy etc
    sinon.resetHistory();
    sinon.reset();
  });

  test('Extension activation', () => {
    const extension = vscode.extensions.getExtension(`mhagnumdw.${EXTENSION_NAME}`);
    assert.ok(extension, 'Extension should be defined');
    assert.strictEqual(extension?.isActive, true, 'Extension should be active');
  });

  test('Toggles should be empty at start', () => {
    const items = extension.getAllTogglesFromConf();
    assert.strictEqual(items.length, 0, 'Settings should be empty');
  });

  test('Add toggle to status bar and rotate them', async () => {
    await extension.addToggle('editor.renderWhitespace', 'whitespace', ["none", "all"]);

    await extension.click('editor.renderWhitespace');
    assert.strictEqual(extension.getValueFromConf('editor.renderWhitespace'), 'none');

    await extension.click('editor.renderWhitespace');
    assert.strictEqual(extension.getValueFromConf('editor.renderWhitespace'), 'all');

    await extension.click('editor.renderWhitespace');
    assert.strictEqual(extension.getValueFromConf('editor.renderWhitespace'), 'none');
  });

  test('Add two toggles and remove one', async () => {
    await extension.addToggle('editor.renderWhitespace', 'whitespace', ["none", "all"]);
    await extension.addToggle('editor.cursorStyle', 'cursor', ["line", "block"]);

    let items = extension.getAllTogglesFromConf();
    assert.strictEqual(items.length, 2, 'There should be two settings');
    assert.strictEqual(items[0].property, 'editor.renderWhitespace', 'First setting should match');
    assert.strictEqual(items[1].property, 'editor.cursorStyle', 'Second setting should match');

    items.shift(); // Remove the first toggle
    await extension.setToggles(items);

    items = extension.getAllTogglesFromConf();
    assert.strictEqual(items.length, 1, 'There should be one setting left');
    assert.strictEqual(items[0].property, 'editor.cursorStyle', 'Remaining setting should match');
  });

  test('Toggle array/object settings', async () => {
    await extension.addToggle('editor.rulers', 'symbol-ruler', [[], [80]]);

    // Default value for editor.rulers is [], so first click should set it to [80]
    await extension.click('editor.rulers');
    assert.deepStrictEqual(extension.getValueFromConf('editor.rulers'), [80]);

    // Second click should set it back to []
    await extension.click('editor.rulers');
    assert.deepStrictEqual(extension.getValueFromConf('editor.rulers'), []);
  });

  test('Add workspace toggle and rotate it', async () => {
    await extension.addToggle('editor.renderWhitespace', 'whitespace', ["none", "all"], true);

    await extension.click('editor.renderWhitespace');
    assert.strictEqual(extension.getWorkspaceValueFromConf('editor.renderWhitespace'), 'none');

    await extension.click('editor.renderWhitespace');
    assert.strictEqual(extension.getWorkspaceValueFromConf('editor.renderWhitespace'), 'all');

    await extension.click('editor.renderWhitespace');
    assert.strictEqual(extension.getWorkspaceValueFromConf('editor.renderWhitespace'), 'none');
  });

  test('Add toggle with disabledValue', async () => {
    await extension.addToggle('editor.renderWhitespace', 'whitespace', ["none", "all"], false, "none");

    await extension.click('editor.renderWhitespace');
    assert.strictEqual(extension.getValueFromConf('editor.renderWhitespace'), 'none');

    await extension.click('editor.renderWhitespace');
    assert.strictEqual(extension.getValueFromConf('editor.renderWhitespace'), 'all');
  });

  test('Refresh status bar item when setting changes externally', async () => {
    await extension.addToggle('editor.renderWhitespace', 'whitespace', ["none", "all"], false, "none");
    const item = ExtensionManager.getInstance().getStatusBarItem('editor.renderWhitespace');
    assert.ok(item, 'Status bar item should exist');

    await extension.setValue('editor.renderWhitespace', 'all');
    assert.strictEqual(item.tooltip, 'editor.renderWhitespace: all');
    assert.strictEqual(item.color, undefined, 'Item should not be grayed out');

    await extension.setValue('editor.renderWhitespace', 'none');
    assert.strictEqual(item.tooltip, 'editor.renderWhitespace: none');
    assert.deepStrictEqual(item.color, new vscode.ThemeColor('disabledForeground'), 'Item should be grayed out');
  });

  test('Status bar items have a unique id and name', async () => {
    await extension.addToggle('editor.renderWhitespace', 'whitespace', ["none", "all"]);
    await extension.addToggle('editor.cursorStyle', 'cursor', ["line", "block"]);

    const whitespaceItem = ExtensionManager.getInstance().getStatusBarItem('editor.renderWhitespace');
    assert.strictEqual(whitespaceItem?.id, 'editor.renderWhitespace');
    assert.strictEqual(whitespaceItem?.name, 'Easy Toggle Settings: editor.renderWhitespace');

    const cursorItem = ExtensionManager.getInstance().getStatusBarItem('editor.cursorStyle');
    assert.strictEqual(cursorItem?.id, 'editor.cursorStyle');
    assert.strictEqual(cursorItem?.name, 'Easy Toggle Settings: editor.cursorStyle');
  });

  test('Add duplicate toggle', async () => {
    const showWarningMessageSpy = sinon.spy(vscode.window, 'showWarningMessage');

    await extension.addToggle('editor.renderWhitespace', 'whitespace', ["none", "all"]);
    await extension.addToggle('editor.renderWhitespace', 'whitespace', ["fake1", "fake2"]);

    assert.strictEqual(ExtensionManager.getInstance().totalStatusBarItems, 1);

    const toggle = ExtensionManager.getInstance().allStatusBarItems[0];
    assert.strictEqual(toggle.property, 'editor.renderWhitespace');
    assert.strictEqual(toggle.values.length, 2);
    assert.strictEqual(toggle.values[0], 'none');
    assert.strictEqual(toggle.values[1], 'all');

    sinon.assert.calledWith(showWarningMessageSpy, 'The following properties are duplicated: editor.renderWhitespace. Only the first occurrence of each will be considered.');
  });

  test('Add two duplicates toggles', async () => {
    const showWarningMessageSpy = sinon.spy(vscode.window, 'showWarningMessage');

    await extension.addToggle('editor.renderWhitespace', 'whitespace', ["none", "all"]);
    await extension.addToggle('editor.renderWhitespace', 'whitespace', ["fake1", "fake2"]);

    await extension.addToggle('editor.cursorStyle', 'cursor', ["line", "block"]);
    await extension.addToggle('editor.cursorStyle', 'cursor', ["fake3", "fake4"]);

    assert.strictEqual(ExtensionManager.getInstance().totalStatusBarItems, 2);
    sinon.assert.calledWith(showWarningMessageSpy, 'The following properties are duplicated: editor.renderWhitespace; editor.cursorStyle. Only the first occurrence of each will be considered.');
  });

  test('Disable extension', async () => {
    await extension.addToggle('editor.renderWhitespace', 'whitespace', ["none", "all"]);
    await extension.addToggle('editor.cursorStyle', 'cursor', ["line", "block"]);
    assert.strictEqual(ExtensionManager.getInstance().totalStatusBarItems, 2, 'There should be two status bar items');

    const showInformationMessageSpy = sinon.spy(vscode.window, 'showInformationMessage');

    await extension.disableExtension();
    assert.strictEqual(ExtensionManager.getInstance().totalStatusBarItems, 0, 'Settings should be empty after disabling');
    sinon.assert.calledWith(showInformationMessageSpy, `Extension ${EXTENSION_NAME} is disabled.`);
  });

  test('Enable extension', async () => {
    await extension.addToggle('editor.renderWhitespace', 'whitespace', ["none", "all"]);
    await extension.addToggle('editor.cursorStyle', 'cursor', ["line", "block"]);
    await extension.disableExtension();
    assert.strictEqual(ExtensionManager.getInstance().totalStatusBarItems, 0, 'Settings should be empty after disabling');

    const showInformationMessageSpy = sinon.spy(vscode.window, 'showInformationMessage');

    await extension.enableExtension();
    assert.strictEqual(ExtensionManager.getInstance().totalStatusBarItems, 2, 'There should be two status bar items after enabling');
    sinon.assert.calledWith(showInformationMessageSpy, `Extension ${EXTENSION_NAME} is enabled.`);
  });

  test('Do not accumulate subscriptions when recreating items or toggling the extension', async () => {
    await extension.addToggle('editor.renderWhitespace', 'whitespace', ["none", "all"]);
    const initialSubscriptions = ExtensionManager.getInstance().totalSubscriptions;

    await extension.addToggle('editor.cursorStyle', 'cursor', ["line", "block"]);
    await extension.disableExtension();
    await extension.enableExtension();
    await extension.disableExtension();
    await extension.enableExtension();

    assert.strictEqual(ExtensionManager.getInstance().totalStatusBarItems, 2, 'There should be two status bar items');
    assert.strictEqual(ExtensionManager.getInstance().totalSubscriptions, initialSubscriptions, 'Subscriptions should not grow');
  });

  test('Toggle command is contributed and registered', async () => {
    const packageJSON = vscode.extensions.getExtension(`mhagnumdw.${EXTENSION_NAME}`)?.packageJSON;
    const contributed = packageJSON.contributes.commands.some((c: { command: string }) => c.command === TOGGLE_COMMAND);
    assert.ok(contributed, 'Command should be contributed in package.json');

    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes(TOGGLE_COMMAND), 'Command should be registered');
  });

  test('Toggle command cycles the property passed as argument', async () => {
    await extension.addToggle('editor.renderWhitespace', 'whitespace', ["none", "all"]);

    await extension.runToggleCommand({ property: 'editor.renderWhitespace' }, 'editor.renderWhitespace');
    assert.strictEqual(extension.getValueFromConf('editor.renderWhitespace'), 'none');

    await extension.runToggleCommand({ property: 'editor.renderWhitespace' }, 'editor.renderWhitespace');
    assert.strictEqual(extension.getValueFromConf('editor.renderWhitespace'), 'all');
  });

  test('Toggle command without arguments shows a Quick Pick and cycles the picked setting', async () => {
    await extension.addToggle('editor.renderWhitespace', 'whitespace', ["none", "all"]);
    await extension.addToggle('editor.cursorStyle', 'cursor', ["line", "block"], true);
    await extension.setValue('editor.renderWhitespace', 'all');
    await extension.setValue('editor.cursorStyle', 'block');
    const showQuickPickStub = sinon.stub(vscode.window, 'showQuickPick')
      .callsFake((async (items: any) => (await items)[1]) as any);

    await extension.runToggleCommand(undefined, 'editor.cursorStyle');

    const picks = showQuickPickStub.firstCall.args[0] as { label: string, description: string }[];
    assert.deepStrictEqual(picks.map(p => [p.label, p.description]), [
      ['$(whitespace) editor.renderWhitespace', '"all" → "none"'],
      ['$(cursor) editor.cursorStyle', '"block" → "line" (workspace)'],
    ]);
    assert.strictEqual(extension.getWorkspaceValueFromConf('editor.cursorStyle'), 'line');
  });

  test('Toggle command does nothing when the Quick Pick is cancelled', async () => {
    await extension.addToggle('editor.renderWhitespace', 'whitespace', ["none", "all"]);
    sinon.stub(vscode.window, 'showQuickPick').resolves(undefined);

    await extension.runToggleCommand();

    assert.strictEqual(extension.getGlobalValueFromConf('editor.renderWhitespace'), undefined);
  });

  test('Toggle command without configured items shows a message', async () => {
    const showInformationMessageStub = sinon.stub(vscode.window, 'showInformationMessage').resolves(undefined);
    const showQuickPickSpy = sinon.spy(vscode.window, 'showQuickPick');

    await extension.runToggleCommand();

    assert.deepStrictEqual(showInformationMessageStub.firstCall.args, [`No settings configured in ${EXTENSION_NAME}.items.`, 'Open Settings']);
    sinon.assert.notCalled(showQuickPickSpy);
  });

  test('Toggle command with an unconfigured property shows a warning', async () => {
    await extension.addToggle('editor.renderWhitespace', 'whitespace', ["none", "all"]);
    const showWarningMessageStub = sinon.stub(vscode.window, 'showWarningMessage').resolves(undefined);

    await extension.runToggleCommand({ property: 'editor.cursorStyle' });

    assert.deepStrictEqual(showWarningMessageStub.firstCall.args, [`The property editor.cursorStyle is not configured in ${EXTENSION_NAME}.items.`, 'Open Settings']);
    assert.strictEqual(extension.getGlobalValueFromConf('editor.cursorStyle'), undefined);
  });

  test('Toggle command opens the settings from the message action', async () => {
    const showWarningMessageStub = sinon.stub(vscode.window, 'showWarningMessage').resolves('Open Settings' as any);
    const executeCommandStub = sinon.stub(vscode.commands, 'executeCommand').callThrough();
    executeCommandStub.withArgs('workbench.action.openSettings').resolves();

    await extension.runToggleCommand({ property: 'editor.cursorStyle' });
    await showWarningMessageStub.firstCall.returnValue;

    sinon.assert.calledWith(executeCommandStub, 'workbench.action.openSettings', `${EXTENSION_NAME}.items`);
  });

  test('Toggle command with invalid arguments shows an error', async () => {
    const showErrorMessageStub = sinon.stub(vscode.window, 'showErrorMessage').resolves(undefined);
    const invalidArgs = [{}, { property: 1 }, { property: ' ' }, 'editor.renderWhitespace', null];

    for (const args of invalidArgs) {
      await extension.runToggleCommand(args);
    }

    assert.strictEqual(showErrorMessageStub.callCount, invalidArgs.length);
    sinon.assert.alwaysCalledWith(showErrorMessageStub, `Invalid arguments for ${TOGGLE_COMMAND}. Expected: { "property": "<setting name>" }.`);
  });

  test('Toggle command warns when the extension is disabled', async () => {
    await extension.addToggle('editor.renderWhitespace', 'whitespace', ["none", "all"]);
    await extension.disableExtension();
    const showWarningMessageStub = sinon.stub(vscode.window, 'showWarningMessage').resolves(undefined);

    await extension.runToggleCommand({ property: 'editor.renderWhitespace' });

    sinon.assert.calledWith(showWarningMessageStub, `Extension ${EXTENSION_NAME} is disabled.`);
    assert.strictEqual(extension.getGlobalValueFromConf('editor.renderWhitespace'), undefined);
  });

  test('cycleSetting: error on update property value', async () => {
    await extension.addToggle('editor.renderWhitespace', 'whitespace', ["none", "all"]);

    const getConfigurationFake = { // is not possible to stub vscode.WorkspaceConfiguration.update
      get: sinon.stub().returns('none'), // Simulate next value
      update: sinon.stub().rejects(new Error('Simulated error')) // Stub to update
    };
    sinon.stub(vscode.workspace, 'getConfiguration').returns(getConfigurationFake as any);
    const showErrorMessageSpy = sinon.spy(vscode.window, 'showErrorMessage');
    // TODO: I couldn't mock the console.error with sinon, try again later

    await extension.click('editor.renderWhitespace', false);

    sinon.assert.calledWith(showErrorMessageSpy, 'Failed to update setting editor.renderWhitespace: Error: Simulated error');
  });

});

suite('getNextValue', () => {

  test('Return the next value', () => {
    assert.strictEqual(getNextValue(['none', 'boundary', 'all'], 'none'), 'boundary');
    assert.strictEqual(getNextValue(['none', 'boundary', 'all'], 'boundary'), 'all');
  });

  test('Wrap around to the first value', () => {
    assert.strictEqual(getNextValue([true, false], false), true);
  });

  test('Return the first value when the current value is not in the list', () => {
    assert.strictEqual(getNextValue(['none', 'all'], 'selection'), 'none');
    assert.strictEqual(getNextValue(['none', 'all'], undefined), 'none');
  });

  test('Compare arrays and objects by content', () => {
    assert.deepStrictEqual(getNextValue([[], [80]], []), [80]);
    assert.deepStrictEqual(getNextValue([{ a: 1 }, { a: 2 }], { a: 2 }), { a: 1 });
  });

});

/**
 * Class to manage the extension settings and simulate user actions.
 */
class TestExtensionManager {

  /** Simulate the user adding a toggle */
  async addToggle(property: string, icon: string, values: any[], isWorkspace?: boolean, disabledValue?: any) {
    const items: ToggleSetting[] = this.config.get('items') || [];
    items.push({ property, icon, values, isWorkspace, disabledValue });
    await this.config.update('items', items, vscode.ConfigurationTarget.Global);
  }

  /** Simulate the user updating all toggles */
  async setToggles(items: ToggleSetting[]) {
    await this.config.update('items', items, vscode.ConfigurationTarget.Global);
  }

  /** Simulate the user disabling the extension */
  async disableExtension() {
    await this.config.update('enabled', false, vscode.ConfigurationTarget.Global);
  }

  /** Simulate the user enabling the extension */
  async enableExtension() {
    await this.config.update('enabled', true, vscode.ConfigurationTarget.Global);
  }

  /** Simulate the user clicking the status bar item */
  async click(property: string, wait = true) {
    const commandId = ExtensionManager.getCommandId(property);
    // listen before executing, since the command resolves only after the setting is updated
    const changed = wait ? waitForConfigChange(property) : Promise.resolve();
    await vscode.commands.executeCommand(commandId);
    await changed;
  }

  /** Simulate the user running the generic toggle command, optionally waiting for a setting change */
  async runToggleCommand(args?: unknown, waitProperty?: string) {
    const changed = waitProperty ? waitForConfigChange(waitProperty) : Promise.resolve();
    await vscode.commands.executeCommand(TOGGLE_COMMAND, ...(args === undefined ? [] : [args]));
    await changed;
  }

  /** Get the global (user) value of a property from the configuration */
  getGlobalValueFromConf(property: string): unknown {
    return vscode.workspace.getConfiguration().inspect(property)?.globalValue;
  }

  /** Simulate the user changing a setting outside the extension */
  async setValue(property: string, value: unknown) {
    const changed = waitForConfigChange(property);
    await vscode.workspace.getConfiguration().update(property, value, vscode.ConfigurationTarget.Global);
    await changed;
  }

  /** Get the value of a property from the configuration */
  getValueFromConf(property: string): unknown {
    return vscode.workspace.getConfiguration().get(property);
  }

  /** Get the workspace value of a property from the configuration */
  getWorkspaceValueFromConf(property: string): unknown {
    const configData = vscode.workspace.getConfiguration().inspect(property);
    return configData?.workspaceValue;
  }

  /** Get the all status bar items */
  getAllTogglesFromConf(): ToggleSetting[] {
    return this.config.get('items') as ToggleSetting[];
  }

  /** Clear all extension settings */
  async clearAllTogglesFromConf() {
    // TODO: how to clear `EXTENSION_NAME` property all at once instead of one by one?
    await this.config.update('items', undefined, vscode.ConfigurationTarget.Global);
    await this.config.update('enabled', undefined, vscode.ConfigurationTarget.Global);
    
    // Clear any test property configured in tests to not affect other tests
    await vscode.workspace.getConfiguration().update('editor.renderWhitespace', undefined, vscode.ConfigurationTarget.Workspace);
    await vscode.workspace.getConfiguration().update('editor.renderWhitespace', undefined, vscode.ConfigurationTarget.Global);
    await vscode.workspace.getConfiguration().update('editor.cursorStyle', undefined, vscode.ConfigurationTarget.Workspace);
    await vscode.workspace.getConfiguration().update('editor.cursorStyle', undefined, vscode.ConfigurationTarget.Global);
    await vscode.workspace.getConfiguration().update('editor.rulers', undefined, vscode.ConfigurationTarget.Workspace);
    await vscode.workspace.getConfiguration().update('editor.rulers', undefined, vscode.ConfigurationTarget.Global);
  }

  /** Get the configuration for the extension */
  get config() {
    return vscode.workspace.getConfiguration(EXTENSION_NAME);
  }

}

// Function to wait for a configuration change
const waitForConfigChange = (expectedKey: string): Promise<void> => {
  return new Promise((resolve) => {
    const disposable = vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration(expectedKey)) {
        disposable.dispose();
        resolve();
      }
    });
  });
};
