import { useEffect, useMemo, useRef, useState } from "react";
import {
  Config,
  DEFAULT_RESOLUTION,
  DEFAUTL_BASE_HEIGHT,
  getConfigFromStorage,
} from "./Config";
import iframe from "./iframe.module.css";

function App() {
  const [config, setConfig] = useState<Config>(getConfigFromStorage());
  const {
    resolutions = DEFAULT_RESOLUTION,
    baseResolution = DEFAUTL_BASE_HEIGHT,
    isMobileFirst,
    latestUrl: urlConfirmada,
  } = config;
  const [urlBase, setUrlBase] = useState<string>(urlConfirmada);
  const extraIframesRefs = useRef<HTMLIFrameElement[]>([]);

  function registerIframe(index: number) {
    return function (ref: HTMLIFrameElement) {
      extraIframesRefs.current[index] = ref;
    };
  }

  useEffect(() => {
    localStorage.setItem("config", JSON.stringify(config));
  }, [config]);

  function onLoadedMainIframe({ target }: any) {
    window.onmessage = (e: any) => {
      extraIframesRefs.current.filter(Boolean).forEach((iframe) => {
        iframe.contentWindow!.document.children[0].innerHTML = `<base href="${urlConfirmada}">${e.data.newHTML}`;
      });
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

  const resolutionsSorted = useMemo(
    () =>
      resolutions.sort(({ mobile }, { mobile: mobile2 }) =>
        isMobileFirst
          ? Number(mobile2) - Number(mobile)
          : Number(mobile) - Number(mobile2)
      ),
    [isMobileFirst, resolutions]
  );

  console.warn("resolutions", resolutionsSorted);

  return (
    <div className="App">
      <h1>Qual a URL da aplicação</h1>
      <div>
        <input onChange={({ target: { value } }) => setUrlBase(value)} />
        <button
          onClick={() => {
            try {
              new URL(urlBase!);
              setConfig({
                ...config,
                latestUrl: urlBase,
              });
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
              setConfig({
                ...config,
                isMobileFirst: checked,
              });
            }}
          />
          Mobile First
        </span>
        <button onClick={() => (window.location.href = "/config")}>
          Configurações avançadas
        </button>
      </div>
      {urlConfirmada && (
        <div className={iframe.container}>
          {resolutionsSorted.map((r, i) => {
            const title = `${r.width} x ${r.height}`;
            const howMuchToShrink =
              (100 - (baseResolution * 100) / r.height) / 100;
            const style: React.HTMLAttributes<HTMLIFrameElement>["style"] = {
              width: r.width,
              height: r.height,
              marginBottom: -(r.height * howMuchToShrink),
              marginRight: -(r.width * howMuchToShrink),
              transform: `scale(${1 - howMuchToShrink})`,
              transformOrigin: "0 0",
            };
            return (
              <div>
                {i === 0 ? (
                  <iframe
                    title={title}
                    src={urlConfirmada}
                    style={style}
                    onLoad={onLoadedMainIframe}
                  />
                ) : (
                  <iframe
                    title={title}
                    ref={registerIframe(i - 1)}
                    style={style}
                  />
                )}
                <p className=".disclaimer">{title}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default App;
