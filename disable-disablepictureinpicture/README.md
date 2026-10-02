# disable-disablepictureinpicture

An userscript that removes the `disablePictureInPicture` attribute from video
elements, allowing Picture-in-Picture mode on videos.

It also removes other client-side workarounds against Picture-in-Picture:

- Prevents the site from adding the attribute again.
- Prevents the site from closing Picture-in-Picture when it starts.
- Sends a copy of `mousemove` events to the video below overlay elements, so the
  Picture-in-Picture button shows. This is specifically for browser like Vivaldi
  where the div for danmaku comments intercepts the cursor hover on video.

Obviously can't bypass `Permissions-Policy: picture-in-picture=()` header sent
by the server.
