import { useEffect, useRef, useState } from "react";
import "./App.css";
import { IframeBridgeStore } from "iframe-bridge-store";

interface SharedState {
  count: number;
  message: string;
}

function App() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const bridgeRef = useRef<IframeBridgeStore<SharedState>>();
  const [state, setState] = useState<SharedState>({ count: 0, message: "" });

  useEffect(() => {
    const bridge = new IframeBridgeStore<SharedState>({
      initialState: {
        count: 0,
        message: "Hello from parent",
      },
      methods: {
        parentMethod: () => console.log("Parent method called"),
      },
    });
    bridgeRef.current = bridge;

    const initConnection = async () => {
      if (iframeRef.current) {
        const connection = await bridge.connectToChild({
          iframe: iframeRef.current,
        });
        console.log("Connection established:", connection);

        // 订阅状态更新
        bridge.getStore()?.subscribe((newState) => {
          setState(newState);
        });
      }
    };

    initConnection();
  }, []);

  const handleUpdateState = () => {
    bridgeRef.current?.getStore()?.setState({
      count: state.count + 1,
      message: `Updated from parent: ${Date.now()}`,
    });
  };

  return (
    <div className="app">
      <h1>Parent Application</h1>
      <div className="card">
        <button onClick={handleUpdateState}>Update State</button>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </div>
      <iframe
        ref={iframeRef}
        src="http://localhost:5174"
        style={{ width: "100%", height: "400px", border: "1px solid #ccc" }}
      />
    </div>
  );
}

export default App;
