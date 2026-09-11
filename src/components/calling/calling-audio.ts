// Copyright (c) 2026 Streetlives, Inc.
// Use of this source code is governed by the MIT license in LICENSE.
import { LocalAudioTrack, Room, RoomEvent, Track } from "livekit-client";

export class CallingAudio {
  private room = new Room({ disconnectOnPageLeave: true });
  private track?: LocalAudioTrack;
  private closed = false;
  constructor(
    private container: HTMLElement,
    onDisconnected: () => void,
    onAudioBlocked: () => void,
  ) {
    this.room.on(RoomEvent.Disconnected, () => {
      if (!this.closed) onDisconnected();
    });
    this.room.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind !== Track.Kind.Audio) return;
      const audio = track.attach();
      this.container.appendChild(audio);
      void audio.play().catch(onAudioBlocked);
    });
    this.room.on(RoomEvent.TrackUnsubscribed, (track) =>
      track.detach().forEach((element) => element.remove()),
    );
  }
  async connect(url: string, token: string, stream: MediaStream) {
    await this.room.connect(url, token);
    if (this.closed) {
      await this.room.disconnect();
      return;
    }
    this.track = new LocalAudioTrack(
      stream.getAudioTracks()[0],
      undefined,
      true,
    );
    await this.room.localParticipant.publishTrack(this.track, {
      source: Track.Source.Microphone,
    });
    if (this.closed) await this.room.disconnect();
  }
  async mute(muted: boolean) {
    if (muted) await this.track?.mute();
    else await this.track?.unmute();
  }
  async dtmf(digit: string) {
    const code = "0123456789*#".indexOf(digit);
    if (code >= 0) await this.room.localParticipant.publishDtmf(code, digit);
  }
  async play() {
    await this.room.startAudio();
  }
  async disconnect() {
    this.closed = true;
    this.track?.stop();
    await this.room.disconnect();
    this.container.replaceChildren();
  }
}
