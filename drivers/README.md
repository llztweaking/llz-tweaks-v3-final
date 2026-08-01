# drivers/

Coloque aqui os instaladores oficiais dos drivers (ex: `nvidia-setup.exe`, `chipset-setup.exe`).

Para cada arquivo colocado aqui, adicione uma entrada correspondente no array `driverEntries`
em `electron/main.cjs` com `id`, `name`, `description` e o `file` exato (nome do arquivo nesta pasta).
O botão da seção "Drivers" só aparece no painel quando o arquivo referenciado realmente existe.
