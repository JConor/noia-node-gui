import * as React from "react";
import { remote, shell } from "electron";
import * as path from "path";

import { NodeSettingsActionsCreators } from "@renderer/modules/node-settings/node-settings-module";
import { SettingsLayoutView } from "@renderer/modules/settings-route/settings-route-module";
import { TextFieldView } from "@renderer/modules/shared/shared-module";
import { NotificationsActionsCreators } from "@renderer/modules/notifications/notifications-module";

import "./wallet-route-view.scss";

const FILEPATH = path.join(process.env.APPDATA!, "/noia-node/node.settings");

interface FormFieldsDto {
    walletAddress: string;
}

interface Props {
    walletAddress: string | null;
}

interface State {
    fields: FormFieldsDto;
}

export class WalletRouteView extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            fields: {
                walletAddress: props.walletAddress || ""
            }
        };
    }

    private onSubmit: React.FormEventHandler<HTMLFormElement> = event => {
        event.preventDefault();
        event.stopPropagation();

        const wallet = this.state.fields.walletAddress;

        if (wallet.length !== 42 && wallet.length !== 0) {
            NotificationsActionsCreators.addNotification({
                uid: "form-error",
                title: "Form error",
                message: "Wallet address is not valid.",
                level: "error"
            });
            return;
        }

        NodeSettingsActionsCreators.updateSettings({
            settings: {
                blockchain: {
                    airdropAddress: wallet
                }
            },
            notify: true,
            restartNode: true
        });
    };

    private onTextChange: React.ChangeEventHandler<HTMLInputElement> = event => {
        const value = event.target.value.trim();

        this.setState(state => {
            state.fields.walletAddress = value;
            return state;
        });
    };

    private onPasteClipboard: React.MouseEventHandler<HTMLButtonElement> = () => {
        const value = remote.clipboard.readText().trim();

        this.setState(state => {
            state.fields.walletAddress = value;
            return state;
        });
    };

    private fileFolder: React.MouseEventHandler<HTMLButtonElement> = () => {
        this.setState(state => {
            shell.showItemInFolder(FILEPATH);
            return;
        });
    };

    private helpUrl: React.MouseEventHandler<HTMLButtonElement> = () => {
        this.setState(state => {
            shell.openExternal("https://github.com/noia-network/noia-node-gui/blob/master/WIN_CONFIG_HELP.md");
            return;
        });
    };

    public render(): JSX.Element {
        return (
            <SettingsLayoutView onSubmit={this.onSubmit} className="wallet-route-view">
                <div className="row">
                    <label>Wallet</label>
                    <div className="field multiple">
                        <TextFieldView
                            name="wallet"
                            className="wallet-field"
                            value={this.state.fields.walletAddress}
                            onChange={this.onTextChange}
                            placeholder="Paste your ethereum wallet address here"
                        />
                        <span>
                            <button type="button" className="button small" onClick={this.onPasteClipboard}>
                                Paste from clipboard
                            </button>
                        </span>
                    </div>
                </div>
                <div className="row">
                    <label>Settings</label>
                    <div className="field multiple">
                        <span>
                            <button type="button" className="button small" onClick={this.fileFolder}>
                                File folder
                            </button>
                            <button type="button" className="button small ml-4" onClick={this.helpUrl}>
                                Help
                            </button>
                        </span>
                    </div>
                </div>
            </SettingsLayoutView>
        );
    }
}
