import buiBuiLoading from '../assets/buibuiloading.gif';

export function Loading() {
  return (
    <div className="p-5 flex flex-col justify-center max-w-xs m-auto items-center gap-4 text-center">
      <img src={buiBuiLoading} />
      <h1 className="text-3xl">Loading</h1>
    </div>
  );
}
