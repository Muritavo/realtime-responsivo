import { useEffect, useMemo, useRef, useState } from "react";
import {
  Config,
  DEFAULT_RESOLUTION,
  DEFAUTL_BASE_HEIGHT,
  getConfigFromStorage,
} from "./Config";
import iframe from "./iframe.module.css";
import throttle from "lodash/throttle";

const throttledFunction = throttle((extraIframesRefs: HTMLIFrameElement[], url: string, html: string) => {
  extraIframesRefs.filter(Boolean).forEach((iframe) => {
    iframe.contentWindow!.document.children[0].innerHTML = `<base href="${url}">${html}`;
  });
}, 300);

const getCssSelector = (el: any) => {
  let path = [], parent;
  while (parent = el.parentNode) {
    path.unshift(`${el.tagName}:nth-child(${([].indexOf.call as any)(parent.children, el)+1})`);
    el = parent;
  }
  return `${path.join(' > ')}`.toLowerCase();
};

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
      throttledFunction(extraIframesRefs.current, urlConfirmada, e.data.newHTML);
    };
    target.contentWindow.eval(`(${monitoringFunction.toString()})()`);
    extraIframesRefs.current.filter(Boolean).forEach((iframe) => {
      iframe.contentWindow!.addEventListener("click", ({target: extraIframeTarget}) => {
        if (extraIframeTarget) {
          const selector = getCssSelector(extraIframeTarget);
          target.contentWindow.eval(`document.querySelector("${selector}").dispatchEvent(new Event("click", {bubbles: true}))`);
        }
      });
    });
  }

  const resolutionsSorted = useMemo(
    () =>
      resolutions.filter(r => r.active).sort(({ mobile }, { mobile: mobile2 }) =>
        isMobileFirst
          ? Number(mobile2) - Number(mobile)
          : Number(mobile) - Number(mobile2)
      ),
    [isMobileFirst, resolutions]
  );

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
              <div key={String(i)}>
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

function monitoringFunction() {
  const IGNORED_NDOES = ["SCRIPT", "#comment", "META"];
  function allowedNode(node: Node) {
    return !IGNORED_NDOES.includes(node.nodeName);
  }
  document.querySelectorAll("noscript").forEach(e => e.remove());
  new MutationObserver((mutations) => {
    const detectedMutations = mutations.filter(a => {
      switch (a.type) {
        case "childList":
          const addedNodes = Array.from(a.addedNodes).filter(a => allowedNode(a));
          const removedNodes = Array.from(a.removedNodes).filter(a => allowedNode(a));

          return addedNodes.length || removedNodes.length;
        case "attributes":
          return allowedNode(a.target);
        case "characterData":
          return true;
      }
    });

    if (detectedMutations.length) {
      debugger;
      const parser = new DOMParser();
      const documentManipulator = parser.parseFromString(document.children[0].outerHTML, "text/html");
      const allToRemove = Array.from(documentManipulator.querySelectorAll("script,link")).filter(a => {
        const src = a.getAttribute("src") || a.getAttribute("href");

        if (!src || src.startsWith("/"))
          return false;
        else
          return !src.includes(window.location.origin);
      });
      allToRemove.forEach(a => a.outerHTML = "<link></link>");
      window.parent.postMessage({
        type: "MainUpdate",
        newHTML: documentManipulator.children[0].innerHTML,
      }, '*')
    }
  }).observe(document.children[0], {
    childList: true,
    attributes: true,
    characterData: true,
    subtree: true,
    attributeOldValue: true,
    characterDataOldValue: true
  })
}

export default App;
