package webui

import (
	"embed"
	"io/fs"
)

//go:embed all:build
var ui embed.FS

var FS, _ = fs.Sub(ui, "build")

//go:generate pnpm build
