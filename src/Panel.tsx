import React, { useEffect, useState } from "react";
import {
  useAddonState,
  useChannel,
  useParameter,
} from "@storybook/manager-api";
import { AddonPanel } from "@storybook/components";
import { ADDON_ID, EVENTS, PARAM_KEY } from "./constants";
import { PanelContent } from "./components/PanelContent";
import { format as prettierFormat } from "prettier/standalone";
import * as prettierHtml from "prettier/plugins/html";
import { Options as PrettierOption } from "prettier";

interface PanelProps {
  active: boolean;
}

export const Panel: React.FC<PanelProps> = (props) => {
  // https://storybook.js.org/docs/react/addons/addons-api#useaddonstate
  const [{ code }, setState] = useAddonState(ADDON_ID, {
    code: null,
  });

  // https://storybook.js.org/docs/react/addons/addons-api#usechannel
  useChannel({
    [EVENTS.CODE_UPDATE]: ({ code }) => {
      setState((state) => ({ ...state, code }));
    },
  });

  const parameters = useParameter(PARAM_KEY, {
    highlighter: { showLineNumbers: false, wrapLines: true },
    prettier: {},
  });
  const {
    highlighter: { showLineNumbers = false, wrapLines = true } = {},
    prettier = {},
  } = parameters;

  const prettierConfig: PrettierOption = {
    htmlWhitespaceSensitivity: "ignore",
    ...prettier,
    // Ensure we always pick the html parser
    parser: "html",
    plugins: [prettierHtml],
  };

  const [formattedCode, setFormattedCode] = useState(null);
  useEffect(() => {
    const formatCode = async () => {
      const prettierFormattedCode =
        code && (await prettierFormat(code, prettierConfig));
      setFormattedCode(prettierFormattedCode);
    };
    formatCode().catch((e) => console.error(e));
  }, [code, prettierConfig]);

  return (
    <AddonPanel {...props}>
      <PanelContent
        code={formattedCode}
        showLineNumbers={showLineNumbers}
        wrapLines={wrapLines}
      />
    </AddonPanel>
  );
};
