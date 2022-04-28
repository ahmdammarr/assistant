import React, { useMemo, useEffect, useState } from "react";
import { Preview, utils } from "@ui/previewer";
import { repo_assets } from "@design-sdk/core";
import { useSingleSelection } from "plugin-app";
import {
  EK_GENERATED_CODE_PLAIN,
  EK_IMAGE_ASSET_REPOSITORY_MAP,
} from "@core/constant";
import { vanilla_presets } from "@app/design-to-code/framework-option";
import { fromApp } from "@app/design-to-code/__plugin/events";
import Dialog from "@material-ui/core/Dialog";
import { FullscreenAppbarActionButton } from "./components";
import { FullsreenAppbar } from "./components/fullscreen-appbar";
import { OpenInEditorButton } from "app/lib/components";

const vanilla_config = vanilla_presets.vanilla_default;

function usePreview() {
  const selection = useSingleSelection();
  const [source, setSource] = useState<string>();

  const handle_vanilla_preview_source = (
    v: string,
    r?: repo_assets.TransportableImageRepository
  ) => {
    setSource(utils.inject_assets_source_to_vanilla(v, r));
  };

  const handleSourceInput = ({ src }: { src: string }) => {
    handle_vanilla_preview_source(src);
  };

  const onMessage = (ev: MessageEvent) => {
    const msg = ev.data.pluginMessage;
    if (msg) {
      switch (msg.type) {
        case EK_GENERATED_CODE_PLAIN:
          handleSourceInput({
            src: msg.data.vanilla_preview_source,
          });

          break;
        case EK_IMAGE_ASSET_REPOSITORY_MAP:
          const imageRepo =
            msg.data as repo_assets.TransportableImageRepository;
          repo_assets.ImageHostingRepository.setRepository(imageRepo);
          handle_vanilla_preview_source(source, imageRepo);
          break;
      }
    } else {
      // ignore
    }
  };

  /** post to code thread about target framework change */
  useEffect(() => {
    fromApp({
      type: "code-gen-request",
      option: vanilla_config,
      config: {
        do_generate_vanilla_preview_source: true,
      },
    });
  }, [selection?.id]);

  /** register event listener for events from code thread. */
  useEffect(
    () => {
      window.addEventListener("message", onMessage);
      return () => {
        window.removeEventListener("message", onMessage);
      };
    },
    // having dependencies becuase event listener must be registered when there is no saved cache when using cached mode.
    [selection?.id]
  );

  return {
    source,
    width: selection?.node?.width,
    height: selection?.node?.height,
    id: selection?.id,
    isRoot: selection?.node && selection.node.parent.origin === "PAGE",
    type: selection?.node?.type,
  };
}

export function PreviewScreen() {
  const { source, id, width, height, isRoot, type } = usePreview();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const _is_publishable_frame = isRoot && type === "FRAME";

  useEffect(() => {
    if (source) {
      setIsFullscreen(true);
    }
  }, [source]);

  const preview = (
    <Preview
      key={source}
      // auto
      type="responsive"
      data={source}
      id={id}
      origin_size={{
        width: width,
        height: height,
      }}
      isAutoSizable={true}
      height={300} //FIXME:
    />
  );

  return (
    <>
      {isFullscreen ? (
        <Dialog open={source !== undefined} fullScreen>
          <div>
            <FullsreenAppbar
              onBack={() => {
                setIsFullscreen(false);
              }}
              actions={
                <>
                  <OpenInEditorButton
                    scene={{ id }}
                    button={
                      <FullscreenAppbarActionButton>
                        Open in Grida
                      </FullscreenAppbarActionButton>
                    }
                  />
                  <FullscreenAppbarActionButton
                    title={
                      _is_publishable_frame
                        ? "publish this frame as a website"
                        : "only root frames can be published"
                    }
                    disabled={!_is_publishable_frame}
                    onClick={() => {
                      // TODO:
                    }}
                  >
                    Publish
                  </FullscreenAppbarActionButton>
                </>
              }
            />
            {preview}
          </div>
        </Dialog>
      ) : (
        <>{preview}</>
      )}
    </>
  );
}
