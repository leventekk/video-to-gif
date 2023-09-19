import { Static, Type } from '@sinclair/typebox';

export const ConvertRequest = Type.Object({
  url: Type.String(),
});

export type ConvertRequestType = Static<typeof ConvertRequest>;
