// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import axios from "axios";

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

export async function POST(request: Request) {
  const req = await request.json();
  const url = SLACK_WEBHOOK_URL;

  if (!url) throw new Error("slack webhook URL is missing");

  try {
    const res = await axios.post(url, { text: req.text });
    return Response.json(res.data);
  } catch (e) {
    return Response.json(e, { status: 500 });
  }
}
