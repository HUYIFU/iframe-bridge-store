import { useEffect, useRef, useState } from "react";
import { IframeBridgeStore } from "iframe-bridge-store";
import "./App.css";

interface SharedState {
  count: number;
  message: string;
}

function App() {
  const bridgeRef = useRef<IframeBridgeStore<SharedState> | null>();
  const [state, setState] = useState<SharedState>({ count: 0, message: "" });

  useEffect(() => {
    const bridge = new IframeBridgeStore<SharedState>({
      methods: {
        childMethod: () => console.log("Child method called"),
      },
    });
    bridgeRef.current = bridge;

    const initConnection = async () => {
      const connection = await bridge.connectToParent({});
      console.log("Connection established:", connection);

      // 订阅状态更新
      bridge.getStore()?.subscribe((newState) => {
        setState(newState);
      });
    };

    initConnection();
  }, []);

  const handleUpdateState = () => {
    bridgeRef.current?.getStore()?.setState({
      count: state.count + 1,
      message: `Updated from child: ${Date.now()}`,
    });
  };

  return (
    <div className="app">
      <h1>Child Application</h1>
      <div className="card">
        <button onClick={handleUpdateState}>Update State</button>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </div>
    </div>
  );
}

export default App;
