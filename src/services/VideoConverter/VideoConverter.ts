export interface VideoConverter {
  convert(path: string, outputPath: string): Promise<Nullable<string>>;
}
