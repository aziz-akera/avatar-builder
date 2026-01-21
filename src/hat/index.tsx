import React from "react";

import Turban from "./turban";
import Beanie from "./beanie";
import Hijab from "./hijab";

export default function hat(props: { color: string, style: string }): JSX.Element | null {
  const { style, color } = props;
  switch (style) {
    case "beanie": return <Beanie color={color} />;
    case "turban": return <Turban color={color} />;
    case "hijab": return <Hijab color={color} />;
    case "none":
    default:
      return null;
  }
}
