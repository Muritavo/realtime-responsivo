import { useEffect, useState } from "react";

export type Config = {
  resolutions: {
    width: number;
    height: number;
    mobile: boolean;
    active: boolean;
  }[];
  baseResolution: number;
  latestUrl: string;
  isMobileFirst: boolean;
};

export const DEFAULT_RESOLUTION = [
  {
    height: 1080,
    width: 1920,
    mobile: false,
    active: true
  },
  {
    height: 568,
    width: 320,
    mobile: true,
    active: true
  },
];

export const DEFAUTL_BASE_HEIGHT = 568;

export const getConfigFromStorage = () =>
  JSON.parse(
    localStorage.getItem("config") ||
      JSON.stringify({
        resolutions: DEFAULT_RESOLUTION,
        baseResolution: DEFAUTL_BASE_HEIGHT,
      })
  );

export default function ConfigComponent() {
  const [form, setForm] = useState<Config>(getConfigFromStorage());

  useEffect(() => {
    localStorage.setItem("config", JSON.stringify(form));
  }, [form]);

  return (
    <>
      <h1>Configurações</h1>
      <h2>Resoluções</h2>
      {form.resolutions.map((r, i) => (
        <tr key={i}>
          <td>
            <p>Largura</p>
            <input
              type="number"
              defaultValue={form.resolutions[i].width}
              onChange={({ target: { value } }) =>
                setForm((prevForm) => {
                  prevForm.resolutions[i].width = Number(value);
                  return { ...prevForm };
                })
              }
            />
          </td>
          <td>
            <p>Altura</p>
            <input
              type="number"
              defaultValue={form.resolutions[i].height}
              onChange={({ target: { value } }) =>
                setForm((prevForm) => {
                  prevForm.resolutions[i].height = Number(value);
                  return { ...prevForm };
                })
              }
            />
          </td>
          <td>
            <p>Ativo</p>
            <input
              type="checkbox"
              defaultChecked={form.resolutions[i].active}
              onChange={({ target: { checked } }) =>
                setForm((prevForm) => {
                  prevForm.resolutions[i].active = checked;
                  return { ...prevForm };
                })
              }
            />
          </td>
          <td>
            <p>Mobile</p>
            <input
              type="checkbox"
              defaultChecked={form.resolutions[i].mobile}
              onChange={({ target: { checked } }) =>
                setForm((prevForm) => {
                  prevForm.resolutions[i].mobile = checked;
                  return { ...prevForm };
                })
              }
            />
          </td>
          <td>
            <button
              onClick={() =>
                setForm((prevForm) => {
                  prevForm.resolutions.splice(i, 1);
                  return { ...prevForm };
                })
              }
            >
              Remover
            </button>
          </td>
        </tr>
      ))}
      <button
        onClick={() =>
          setForm((prevForm) => ({
            ...prevForm,
            resolutions: [
              ...prevForm.resolutions,
              {
                width: 1920,
                height: 1080,
                mobile: false,
                active: true
              },
            ],
          }))
        }
      >
        Adicionar
      </button>
      <h2>Altura máxima (usada para escalar e alinhar os frames)</h2>
      <input
        type="number"
        defaultValue={form.baseResolution}
        onChange={({ target: { value } }) =>
          setForm((prevForm) => ({
            ...prevForm,
            baseResolution: Number(value),
          }))
        }
      />
    </>
  );
}
