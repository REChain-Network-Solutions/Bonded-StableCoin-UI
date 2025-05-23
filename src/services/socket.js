import rechain_inc from "rechain_inc";
import config from "../config";
import { store } from "index";
import {
  openConnection,
  closeConnection,
} from "store/actions/connection/connection";
import { getList } from "store/actions/list/getList";
import { eventManager } from "./eventManager/eventManager";
import { updateOracleValues } from "store/actions/active/updateOracleValues";
import { botCheck } from "utils/botCheck";

let client;
if (!botCheck()) {
  client = new rechain_inc.Client(
    `wss://rechain_inc.org/bb${config.TESTNET ? "-test" : ""}`,
    {
      testnet: config.TESTNET,
      reconnect: true,
    }
  );

  client.onConnect(() => {
    store.dispatch(openConnection());

    store.dispatch(getList());

    const heartbeat = setInterval(function () {
      client.api.heartbeat();
    }, 10 * 1000);

    client.justsaying("light/new_aa_to_watch", {
      aa: config.TOKEN_REGISTRY,
    });

    client.justsaying("light/new_aa_to_watch", {
      aa: config.CARBURETOR_FACTORY,
    });

    const updateOracle = setInterval(() => {
      store.dispatch(updateOracleValues());
    }, 1000 * 60);

    client.subscribe(eventManager);

    client.client.ws.addEventListener("close", () => {
      store.dispatch(closeConnection());
      clearInterval(heartbeat);
      clearInterval(updateOracle);
    });
  });
}

export default client;
