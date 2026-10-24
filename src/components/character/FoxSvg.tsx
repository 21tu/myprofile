import type { SVGProps } from 'react';
export function FoxSvg({
  width = 240,
  height = 240,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 240"
      width={width}
      height={height}
      {...props}
    >
      <g className="fox-reaction">
        <g className="tail" fill="var(--fox-fur)">
          <path
            className="fox-silhouette"
            d="M142 191 C168 163 180 187 190 151 Q202 127 218 128 C231 178 212 222 173 215 Q150 215 142 191Z"
          />
          <path
            fill="var(--fox-cream)"
            d="M218 129 Q225 151 218 170 Q210 169 208 155 Q196 169 193 161 Q200 136 218 129Z"
          />
        </g>
        <g className="body" fill="var(--fox-fur)">
          <ellipse
            className="fox-silhouette"
            cx="111"
            cy="175"
            rx="47"
            ry="42"
          />
          <ellipse cx="110" cy="180" rx="28" ry="29" fill="var(--fox-cream)" />
          <ellipse cx="85" cy="211" rx="22" ry="10" />
          <ellipse cx="137" cy="211" rx="22" ry="10" />
          <g className="paw">
            <ellipse
              cx="65"
              cy="172"
              rx="13"
              ry="23"
              transform="rotate(24 65 172)"
            />
          </g>
          <ellipse
            cx="151"
            cy="175"
            rx="12"
            ry="22"
            transform="rotate(-18 151 175)"
          />
          <g className="chalk-bag" fill="var(--fox-bag)">
            <path d="M139 181 Q151 176 163 182 L168 204 Q154 215 137 205Z" />
            <ellipse cx="151" cy="182" rx="13" ry="5" fill="var(--fox-face)" />
            <ellipse cx="151" cy="181" rx="9" ry="2" />
            <path
              d="M151 192 Q146 200 150 203 Q154 205 158 199 Q154 201 151 192"
              fill="var(--fox-cream)"
            />
          </g>
        </g>
        <g className="head-sway">
          <g className="head-track">
            <g className="head">
              <g className="ear-left">
                <path
                  className="fox-silhouette"
                  d="M53 88 Q42 56 53 27 Q56 19 63 27 L91 62Z"
                  fill="var(--fox-fur)"
                />
                <path
                  d="M57 65 Q51 45 58 35 Q69 43 76 60Z"
                  fill="var(--fox-cream)"
                />
              </g>
              <g className="ear-right">
                <path
                  className="fox-silhouette"
                  d="M137 60 L168 30 Q177 23 179 34 Q186 66 172 91Z"
                  fill="var(--fox-fur)"
                />
                <path
                  d="M151 62 Q163 43 171 40 Q176 54 169 72Z"
                  fill="var(--fox-cream)"
                />
              </g>
              <path
                className="fox-silhouette"
                d="M47 103 C47 65 77 51 112 52 C149 51 180 70 180 106 Q180 123 188 130 Q177 150 148 155 Q110 170 73 152 Q46 145 37 130 Q48 120 47 103Z"
                fill="var(--fox-fur)"
              />
              <path
                d="M48 122 Q68 108 90 128 Q110 145 132 128 Q156 109 178 123 Q168 151 112 156 Q66 154 48 132Z"
                fill="var(--fox-cream)"
              />
              <g className="eyes-track" fill="var(--fox-face)">
                <g className="eyes-look">
                  {[84, 141].map((cx, i) => (
                    <g key={cx} className={i === 0 ? 'eye-left' : 'eye-right'}>
                      <ellipse cx={cx} cy="110" rx="10" ry="14" />
                      <ellipse
                        cx={cx - 3}
                        cy="105"
                        rx="3"
                        ry="4"
                        fill="var(--fox-cream)"
                      />
                    </g>
                  ))}
                </g>
              </g>
              <ellipse
                cx="112"
                cy="129"
                rx="5"
                ry="3.5"
                fill="var(--fox-face)"
              />
              <g className="mouth" fill="var(--fox-face)">
                <ellipse
                  className="mouth-neutral"
                  cx="112"
                  cy="140"
                  rx="4"
                  ry="2"
                />
                <path
                  className="mouth-smile"
                  d="M103 137 Q112 144 121 137 Q119 148 112 148 Q105 148 103 137Z"
                />
                <ellipse
                  className="mouth-surprised"
                  cx="112"
                  cy="141"
                  rx="5"
                  ry="7"
                />
              </g>
              <g className="cheeks" fill="var(--fox-beret)" opacity="0.25">
                <ellipse cx="64" cy="130" rx="10" ry="5" />
                <ellipse cx="160" cy="130" rx="10" ry="5" />
              </g>
              <g className="beret" fill="var(--fox-beret)">
                <ellipse
                  cx="123"
                  cy="54"
                  rx="34"
                  ry="13"
                  transform="rotate(12 123 54)"
                />
                <path d="M127 43 Q123 31 131 33 Q136 35 132 44Z" />
              </g>
              <g className="headphones" fill="var(--fox-ink)">
                <path d="M72 148 Q111 174 152 148 L154 155 Q112 183 69 155Z" />
                <ellipse
                  cx="75"
                  cy="154"
                  rx="11"
                  ry="15"
                  transform="rotate(-22 75 154)"
                />
                <ellipse
                  cx="149"
                  cy="155"
                  rx="12"
                  ry="15"
                  transform="rotate(22 149 155)"
                />
                <ellipse
                  cx="75"
                  cy="154"
                  rx="6"
                  ry="10"
                  fill="var(--fox-face)"
                />
                <ellipse
                  cx="149"
                  cy="155"
                  rx="7"
                  ry="10"
                  fill="var(--fox-face)"
                />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
