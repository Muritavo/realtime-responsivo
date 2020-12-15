import { useEffect, useMemo, useRef, useState } from "react";
import iframe from "./iframe.module.css";

function App() {
  const [urlBase, setUrlBase] = useState();
  const [urlConfirmada, setUrlConfirmada] = useState();
  const [mobileFirst, setMobileFirst] = useState();
  const mobileIframeRef = useRef();

  function onLoadedMainIframe({ target }) {
    window.onmessage = (e) => {
      mobileIframeRef.current.contentWindow.document.children[0].innerHTML = `<base href="${urlConfirmada}">${e.data.newHTML}`;
    };
    target.contentWindow.eval(`new MutationObserver(() => {
        window.parent.postMessage({
          type: "MainUpdate",
          newHTML: document.children[0].innerHTML,
          newBody: document.body.innerHTML
        }, '*')
      }).observe(document.children[0], {childList: true,
  attributes: true,
  characterData: true,
  subtree: true,
  attributeOldValue: true,
  characterDataOldValue: true})`);
  }

  const classOrder = useMemo(
    () =>
      mobileFirst ? [iframe.mobile, iframe.base] : [iframe.base, iframe.mobile],
    [mobileFirst]
  );

  return (
    <div className="App">
      <h1>Qual a URL da aplicação</h1>
      <div>
        <input onChange={({ target: { value } }) => setUrlBase(value)} />
        <button
          onClick={() => {
            try {
              new URL(urlBase);
              setUrlConfirmada(urlBase);
            } catch (e) {
              alert("Foi encontrado um problema na URL");
            }
          }}
        >
          Iniciar
        </button>
        <span>
          <input
            type="checkbox"
            onChange={({ target: { checked } }) => {
              setMobileFirst(checked);
            }}
          />
          Mobile First
        </span>
      </div>
      {urlConfirmada && (
        <div className={iframe.container}>
          <iframe
            className={classOrder[0]}
            src={urlConfirmada}
            onLoad={onLoadedMainIframe}
          />
          <iframe ref={mobileIframeRef} className={classOrder[1]} sandbox />
        </div>
      )}
    </div>
  );
}

export default App;
