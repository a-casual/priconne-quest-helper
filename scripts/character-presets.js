let preset_min_rank = 1;
let preset_max_rank = max_character_rank_information.CURRENT;

function build_character_preset_list()
{
    let character_preset_html;
    if (current_language === language.ENGLISH)
    {
        character_preset_html = "<option value=\"default_character\">[Character...]</option>";
    }
    else
    {
        character_preset_html = "<option value=\"default_character\">" + language_json["presets_tab"]["characters_select_option"] + "</option>";
    }

    // ENGLISH IS ALREADY ALPHABETICALLY SORTED
    if (current_language === language.ENGLISH)
    {
        for (let [character_id, character_data_map] of character_map)
        {
            let character_en = character_data_map.get("name") + ((character_data_map.get("thematic") !== "") ?  (" (" + character_data_map.get("thematic") + ")") : "");
            let character_jp = character_data_map.get("name_jp") + ((character_data_map.get("thematic_jp") !== "") ?  ("（" + character_data_map.get("thematic_jp") + "）") : "");
            character_preset_html += "<option value=\"" + character_id + "\"" + ((character_data_map.get("rank_1")[0] === "") ? " disabled" : "") + ">" + character_en + " | " + character_jp + "</option>";
        }
    }
    else
    {
        // SORT CHARACTER MAP
        let sorted_character_map = new Map();
        let character_thematics = {};
        for (let [character_id, character_data_map] of character_map)
        {
            let name_tl_id = character_id.split('_').pop();
            let thematic = character_data_map.get("thematic").replace(" ", "_").toLowerCase();
            let character_translated = language_json["character_names"][name];

            // IF UNIT IS A THEMATIC ; ADD INFO TO BASE VERSION
            if (thematic !== "")
            {
                if (character_thematics[name] === undefined)
                {
                    character_thematics[name] = [];
                }
                character_thematics[name].push(character_id);
            }
            else
            {
                sorted_character_map.set(character_translated, character_data_map)
            }
        }
        sorted_character_map = new Map([...sorted_character_map.entries()].sort());

        // BUILD LIST
        for (let [character_id, character_data_map] of sorted_character_map)
        {
            character_preset_html += get_character_select_html(character_data_map);

            // CHECK THEMATICS
            let name = character_data_map.get("name").toLowerCase();
            if (character_thematics[name] !== undefined)
            {
                let thematics_array = character_thematics[name];
                for (let i = 0 ; i < thematics_array.length ; i++)
                {
                    character_preset_html += get_character_select_html(character_map.get(thematics_array[i]));
                }
            }
        }

        function get_character_select_html(character_data_map)
        {
            let name = character_data_map.get("name").toLowerCase();
            let thematic = character_data_map.get("thematic").replace(" ", "_").toLowerCase();
            let id = (thematic !== "" ? thematic + "_" : "") + name;

            let character_en = character_data_map.get("name") + ((character_data_map.get("thematic") !== "") ?  (" (" + character_data_map.get("thematic") + ")") : "");
            let character_translated = language_json["character_names"][name_tl_id] + ((character_data_map.get("thematic") !== "") ? " (" + language_json["thematics"][thematic] + ")" : "");

            // USE （）IF JAPANESE
            if (current_language === language.JAPANESE)
            {
                character_translated = character_translated.replace(' (', '（').replace(')', '）');
            }

            return "<option value=\"" + id + "\"" + ((character_data_map.get("rank_1")[0] === "") ? " disabled" : "") + ">" + character_translated + " | " + character_en + "</option>";
        }
    }

    document.getElementById("character-preset-list-select").innerHTML = character_preset_html;
}

function update_selected_character_preset_details()
{
    let selected_character = document.getElementById("character-preset-list-select").value;

    if (selected_character === "default_character")
    {
        document.getElementById("preset-character-image").src = get_unit_icon_image_path("placeholder");
        document.getElementById("preset-character-name-label").innerHTML = "";
        document.getElementById("preset-character-load-button").disabled = true;
        document.getElementById("preset-character-load-and-create-project-button").disabled = true;
        document.getElementById("preset-character-min-rank-input").disabled = true;
        document.getElementById("preset-character-max-rank-input").disabled = true;
    }
    else
    {
        if (check_if_character_exists(selected_character) === true)
        {
            let character_name = get_character_data(selected_character, "name");
            let character_thematic = get_character_data(selected_character, "thematic");
            let character_image_name = selected_character;
            let character_thematic_tl;
            let character_tl;

            if (current_language === language.ENGLISH)
            {
                character_thematic_tl = get_character_data(selected_character, "thematic_jp");
                character_tl = get_character_data(selected_character, "name_jp") + ((character_thematic_tl === "") ? "" : "（" + character_thematic_tl + "）");
            }
            else
            {
                let tl_name = selected_character.split('_').pop();
                let tl_thematic = character_thematic.replace(" ", "_").toLowerCase();

                character_thematic_tl = language_json["thematics"][tl_thematic];
                character_tl = language_json["character_names"][tl_name] + ((character_thematic === "") ? "" : " (" + character_thematic_tl + ")");

                // USE （）IF JP
                if (current_language === language.JAPANESE)
                {
                    character_tl = character_tl.replace(' (', '（').replace(')', '）');
                }
            }


            document.getElementById("preset-character-image").src = get_unit_icon_image_path(character_image_name);
            if (current_language === language.ENGLISH)
            {
                document.getElementById("preset-character-name-label").innerHTML = ((character_thematic === "") ? character_name : character_name + " (" + character_thematic + ")") + "<br>" + character_tl;
            }
            else
            {
                document.getElementById("preset-character-name-label").innerHTML = character_tl + "<br>" + ((character_thematic === "") ? character_name : character_name + " (" + character_thematic + ")");
            }
            document.getElementById("preset-character-load-button").disabled = false;
            document.getElementById("preset-character-load-and-create-project-button").disabled = false;
            document.getElementById("preset-character-min-rank-input").disabled = false;
            document.getElementById("preset-character-max-rank-input").disabled = false;
        }
    }
}

function change_min_rank_preset()
{
    const max_value = document.getElementById("preset-character-min-rank-input").max;
    const min_value = document.getElementById("preset-character-min-rank-input").min;

    preset_min_rank = Math.round(document.getElementById("preset-character-min-rank-input").value);

    if (preset_min_rank > max_value)
    {
        document.getElementById("preset-character-min-rank-input").value = max_value;
        preset_min_rank = max_value;
    }
    if (preset_min_rank > preset_max_rank)
    {
        document.getElementById("preset-character-min-rank-input").value = preset_max_rank;
        preset_min_rank = preset_max_rank;
    }
    if (preset_min_rank < min_value)
    {
        document.getElementById("preset-character-min-rank-input").value = min_value;
        preset_min_rank = min_value;
    }

    console.log(get_colored_message("Presets", highlight("Minimum Rank") + color_text(" changed to ", message_status.INFO) + highlight_code(preset_min_rank)));
}

function change_max_rank_preset()
{
    const max_value = document.getElementById("preset-character-max-rank-input").max;
    const min_value = document.getElementById("preset-character-max-rank-input").min;

    preset_max_rank = Math.round(document.getElementById("preset-character-max-rank-input").value);

    if (preset_max_rank > max_value)
    {
        document.getElementById("preset-character-max-rank-input").value = max_value;
        preset_max_rank = max_value;
    }
    if (preset_max_rank < min_value)
    {
        document.getElementById("preset-character-max-rank-input").value = min_value;
        preset_max_rank = min_value;
    }
    if (preset_max_rank < preset_min_rank)
    {
        document.getElementById("preset-character-max-rank-input").value = preset_min_rank;
        preset_max_rank = preset_min_rank;
    }

    console.log(get_colored_message("Presets", highlight("Maximum Rank") + color_text(" changed to ", message_status.INFO) + highlight_code(preset_max_rank)));
}

function load_preset_character_items()
{
    let character_items_map = new Map();
    let selected_character = document.getElementById("character-preset-list-select").value;

    // LOOP THROUGH RANK ITEMS
    for (let i = (preset_min_rank - 1) ; i < preset_max_rank ; i++)
    {
        // GET SPECIFIC RANK ITEMS
        let rank_items = get_character_data(selected_character, "rank_" + (i + 1));

        // ADD RANK ITEMS TO COMPLETE ARRAY
        for (let a = 0 ; a < 6 ; a++)
        {
            // ITEM ISN'T UNDEFINED
            if (rank_items[a] !== "")
            {
                // ADD ITEM TO MAP, BUT CHECK IF IT ALREADY EXISTS.
                if (character_items_map.has(rank_items[a]))
                {
                    character_items_map.set(rank_items[a], (character_items_map.get(rank_items[a]) + 1));
                }
                else
                {
                    character_items_map.set(rank_items[a], 1);
                }
            }
        }
    }

    // CLEAR ALL DATA
    clear_item_table();

    // SET ITEM VALUES
    for (let [item_name, item_amount] of character_items_map)
    {
        document.getElementById(get_equipment_data(item_name, "id") + "-amt").value = item_amount;
    }

    // UPDATE REQUESTED ITEMS
    build_data();

    console.log(get_colored_message("Presets", "Loaded ", message_status.INFO) + highlight(selected_character) + message_status.INFO + "'s equipment for rank " + highlight_code(preset_min_rank) + message_status.INFO + " - " + highlight_code(preset_max_rank));
}

function load_preset_character_items_and_create_project()
{
    // LOAD CHARACTER ITEMS
    load_preset_character_items();

    // COLLECT DATA
    let selected_min_rank_value = document.getElementById("preset-character-min-rank-input").value;
    let selected_max_rank_value = document.getElementById("preset-character-max-rank-input").value;
    let selected_character = document.getElementById("character-preset-list-select").value;

    // DETERMINE PROJECT NAME
    let project_name_suffix = " [" + ((selected_min_rank_value === selected_max_rank_value) ? selected_min_rank_value : (selected_min_rank_value + " - " + selected_max_rank_value)) + "]";
    let project_name = "";    // SUFFIX

    let character_name = get_character_data(selected_character, "name");
    let character_thematic = get_character_data(selected_character, "thematic");
    if (current_language === language.ENGLISH)
    {
        project_name += character_name + ((character_thematic !== "") ? (" (" + character_thematic + ")") : "");
    }
    else
    {
        let character_tl_id = selected_character.split('_').pop();
        character_thematic = character_thematic.replace(" ", "_").toLowerCase();

        let translated_name = language_json["character_names"][character_tl_id] + ((character_thematic !== "") ? " (" + language_json["thematics"][character_thematic] + ")" : "");
        // USE （）IF JP
        if (current_language === language.JAPANESE)
        {
            translated_name = translated_name.replace(' (', '（').replace(')', '）');
        }

        project_name += translated_name;
    }

    // CHECK IF PROJECT NAME ALREADY EXISTS
    if (projects.has(project_name))
    {
        let looking_for_unused_name = true;
        let name_counter = 2;

        while (looking_for_unused_name)
        {
            if (projects.has(project_name + " (" + name_counter + ")"))
            {
                name_counter++;
            }
            else
            {
                looking_for_unused_name = false;
            }
        }
        project_name = project_name + " (" + name_counter + ")";
    }

    // ADD SUFFIX
    project_name += project_name_suffix;

    // SAVE PROJECT
    document.getElementById("project-name-input").value = project_name;
    save_project_data();
}