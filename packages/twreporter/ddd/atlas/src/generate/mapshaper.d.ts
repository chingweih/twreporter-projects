declare module "mapshaper" {
  const mapshaper: {
    runCommands(args: string | string[]): Promise<void>;
  };
  export default mapshaper;
}
