import configparser


class Config():
    file_name = "update_config.ini"
    parser = configparser.ConfigParser(default_section="common")
    parser.read(file_name)

    @classmethod
    def write(cls, section, key, value):
        if section not in cls.parser:
            cls.parser.add_section(section)
        cls.parser.set(section, key, value)
        with open(cls.file_name, "w") as file:
            cls.parser.write(file)
        return True
