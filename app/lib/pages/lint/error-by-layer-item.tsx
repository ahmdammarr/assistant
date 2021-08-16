import styled from "@emotion/styled";
import * as React from "react";
import { Level } from "./lint-colors";
import { LintError, LintErrorIcon } from "./lint-error-icon";
import { LintLevelIndicator } from "./lint-level-indicator";

interface IErrorByLayerItem {
  icon: boolean;
  level: Level;
  expand: boolean;
  error: {
    id: string;
    name: string;
    userMessage: string;
  };
}

const CloseIcon = require("../../../lib/components/assets/close.svg") as string;
const ExpandIcon =
  require("../../../lib/components/assets/expand.svg") as string;

export function ErrorByLayerItem(props: IErrorByLayerItem) {
  return (
    <Wrapper>
      <Inner>
        {props.icon && <LintErrorIcon id={LintError.name} />}
        <Title>{props.error.name}</Title>
        <LintLevelIndicator color={props.level} />
        {props.expand ? <ExpandIcon /> : <CloseIcon />}
      </Inner>
      <SubTitle>{props.error.userMessage}</SubTitle>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  background: #fff;

  &:hover {
    background: #fcfcfc;
  }
`;

const Inner = styled.div`
  display: flex;
`;
const Title = styled.h6`
  margin: 0;

  font-size: 16px;
  font-weight: 500;
  line-height: 20px;
  margin-right: auto;
`;

const SubTitle = styled.h6`
  margin: 0;
  font-size: 12px;
  line-height: 14px;
  margin-top: 4px;
  max-width: 262px;

  color: #666666;
`;
