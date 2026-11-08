
export default function Footer() {
  return (
    <footer className="border-t py-4 text-center text-xs text-gray-500">
      Map data &copy;{" "}
      <a
        href="https://www.openstreetmap.org/copyright"
        className="underline"
      >
        OpenStreetMap
      </a>{" "}
      contributors
    </footer>
  );
}
