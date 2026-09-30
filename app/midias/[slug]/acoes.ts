"use server";

import { buscarMidia } from "@/lib/api";
import {
  gravarAssistidas,
  listarAssistidas,
  slugValido,
} from "@/lib/assistidas";

async function slugDoFormulario(formData: FormData): Promise<string> {
  const slug = formData.get("slug");

  if (!slugValido(slug)) {
    throw new Error("Slug de mídia inválido");
  }

  if (!(await buscarMidia(slug))) {
    throw new Error("Mídia não encontrada");
  }

  return slug;
}

/*
 * Sem `redirect` no fim das duas actions. Gravar ou apagar cookie numa Server
 * Action já faz o Next redesenhar a rota na resposta do mesmo POST (doc de
 * `cookies`, "Understanding Cookie Behavior in Server Functions"), e a URL
 * fica como estava — com o `?temporada=&episodio=` do "Retomar", ou o
 * `?episodios=todos` do podcast. Um `redirect` para `/midias/${slug}` jogava
 * isso fora.
 *
 * Por isso a gravação é incondicional: é ela que dispara o redesenho. Se
 * marcar pulasse a escrita quando o título já está na lista, uma segunda aba
 * aberta na mesma ficha continuaria mostrando o botão velho depois do clique.
 */

export async function marcarComoAssistida(formData: FormData): Promise<void> {
  const slug = await slugDoFormulario(formData);
  const assistidas = await listarAssistidas();

  await gravarAssistidas(
    assistidas.includes(slug) ? assistidas : [...assistidas, slug],
  );
}

export async function desmarcarComoAssistida(
  formData: FormData,
): Promise<void> {
  const slug = await slugDoFormulario(formData);
  const assistidas = await listarAssistidas();

  await gravarAssistidas(assistidas.filter((item) => item !== slug));
}
