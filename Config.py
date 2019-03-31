import configparser


class Config():
    file_name = "update_config.ini"
    parser = configparser.ConfigParser(default_section="common")
    parser.read(file_name)

    @staticmethod
    def write(self, section, key, value):
        if section not in self.__parser:
            self.__parser.add_section(section)
        self.__parser.set(section, key, value)
        with open(self.file_name, "w") as file:
            self.__parser.write(file)
        return True
